# Express × tardisec

Drop-in files for wiring Express to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisecMiddleware.js` | The middleware, taking the parsed manifest as its argument |
| `server.js` | Wiring only. Mounts it ahead of the routes |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`app.use(...)` runs in registration order, so mount it before any route or router. That way
every response gets the headers, including one a route sends directly with
`res.send`/`res.end` rather than falling through to a shared renderer.

Because it runs first, the `res.getHeader` guard only defers to middleware mounted above it.
A route can still overwrite a header afterwards, which is the escape hatch for one that
genuinely needs its own. `res.getHeader` is case-insensitive (Node normalizes header names),
so the guard holds regardless of how the other side cased the key.

The import uses the `with { type: "json" }` attribute, which needs your app running as an ES
module: set `"type": "module"` in `package.json` or rename the file `server.mjs`. On
CommonJS, use `require("./.tardisec.json")` instead.

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
