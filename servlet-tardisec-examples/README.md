# Jakarta Servlet × tardisec

Drop-in files for wiring a servlet app to its synced tardisec config. Jakarta Servlet is the
specification, not a framework, so this is the generic case: Tomcat, Jetty, Undertow, or any
container, with or without a framework on top. Copy them into your app; the `.tardisec.*` files
are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `src/main/java/tardisec/TardisecFilter.java` | The filter: puts `.tardisec.json`'s `http.headers` on every response |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Register it with `@WebFilter(urlPatterns = "/*")` on the class, or in `web.xml` with an optional
`manifestPath` init-param. Both go through the no-arg constructor and `init`, which is why the
class has one alongside the constructor that takes an already-parsed map.

On Spring Boot? The filter is the same file, but registration and one header conflict are not:
[spring-boot-tardisec-examples](../spring-boot-tardisec-examples).

## Two things worth knowing

**Set before the chain, not after.** Once a response is committed, `setHeader` is a silent
no-op, and anything downstream that writes a body commits it. Setting them on the way in is also
what lets your app win: its own `setHeader` later simply overwrites. The `containsHeader` check
only defers to a filter or container that got there first.

**`jakarta`, not `javax`.** Servlet 5.0 renamed the package wholesale. These imports are right
for Jakarta EE 9+, which means Tomcat 10+, Jetty 11+ and Undertow 2.3+. On Tomcat 9 or earlier,
change every `jakarta.servlet` import to `javax.servlet` and nothing else moves.

Jackson does the parsing because most apps already have it. Any other JSON library works;
`headersFrom` is six lines.

Filter order is declaration order in `web.xml`, and unspecified between `@WebFilter` classes, so
declare this one first if another filter of yours also writes security headers.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any
server-rendered page with an inline `<script>` needs a nonce.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when the
file actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that code can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim, sync it straight into your static content
directory with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
