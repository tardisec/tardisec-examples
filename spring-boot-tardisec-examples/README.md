# Spring Boot × tardisec

Drop-in files for wiring a Spring Boot app to its synced tardisec config. Copy them into your
app; the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `src/main/java/tardisec/TardisecFilter.java` | The filter: puts `.tardisec.json`'s `http.headers` on every response |
| `src/main/java/tardisec/TardisecFilterConfig.java` | Wiring only. The `FilterRegistrationBean` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

The filter is the same file as in [servlet-tardisec-examples](../servlet-tardisec-examples),
because Spring Boot's web stack is a servlet container underneath. Two things are specific here.

**Registered at `HIGHEST_PRECEDENCE`.** `FilterRegistrationBean` puts it ahead of everything, so
the headers land on responses that never reach a controller: a 401 from the security chain, a
404 from the dispatcher. The manifest is parsed in the bean rather than in the filter's `init`,
so a missing or malformed file fails the context refresh at startup instead of the first
request.

**Spring Security writes some of these too, and it wins.** Its defaults include
`X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control` and, on HTTPS,
`Strict-Transport-Security`, written by its own filter, which runs after this one and therefore
overwrites those four. Its HSTS carries no `preload` and its defaults know nothing about the
other twenty headers in the manifest. Turn the overlapping writers off with
`http.headers(headers -> headers.defaultsDisabled())`, or accept a response where four headers
come from Spring Security and the rest from tardisec.

WebFlux rather than MVC? A `Filter` is a servlet type and will not be picked up. The equivalent
is a `WebFilter` bean over `ServerWebExchange`, same loop, different types.

For the commit-ordering rule and the `jakarta` versus `javax` split, see the
[Servlet directory's README](../servlet-tardisec-examples). Jackson does the parsing because
Spring Boot already ships it.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any
Thymeleaf page with an inline `<script>` needs a nonce.

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
`.well-known/tardisec-verification.txt` verbatim, sync it straight into
`src/main/resources/static/` with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
