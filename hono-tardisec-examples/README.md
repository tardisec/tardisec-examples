# Hono × tardisec

Drop-in files for wiring Hono to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `src/tardisecMiddleware.js` | The middleware, taking the parsed manifest as its argument |
| `src/index.js` | Middleware applying `.tardisec.json`'s `http.headers` to every response |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Hono matches middleware and routes in registration order, so `app.use("*", ...)` has to come
before any route it should cover; a route registered above it never runs through it.
`await next()` runs first so `c.res` is the finished response by the time the loop reads it,
not whatever an earlier handler set before returning. `c.res.headers` is a Fetch API
`Headers` object, so the already-set check is `.has()` and the write is `.set()`, both
case-insensitive by spec.

Hono runs on Node, Bun, Deno, Cloudflare Workers, and more, so this same middleware travels
with the app across runtimes. What doesn't travel: static assets served by a runtime's own
static-file handling (`serveStatic`, a platform assets binding, Bun's `routes` static
responses) skip the `fetch` handler entirely and never reach this middleware. Apply the map
at the host for those, or route them through a handler that this middleware still wraps.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any HTML
you render with an inline `<script>` needs a nonce.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when
the file actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that code can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim, sync it straight into your static
directory with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
