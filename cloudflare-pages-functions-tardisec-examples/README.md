# Cloudflare Pages Functions × tardisec

Drop-in files for wiring a Cloudflare Pages project to its synced tardisec config. Copy them
into your app; the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `functions/_middleware.js` | Sets `.tardisec.json`'s `http.headers` on every response the project serves |
| `.tardisec.cloudflare-pages-functions.js` | Synced. The API's own version of the middleware, with the headers inlined |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`_middleware.js` at the root of `functions/` runs for every route, so one file covers the
static output and any Function the project already has. A project with no Functions at all can
ship a `_headers` file instead: [cloudflare-tardisec-examples](../cloudflare-tardisec-examples).
That file only applies to static output, so a project that later adds a Function needs this
middleware anyway.

No build-time CSP hashing here, so the enforce CSP ships as-is. `script-src-elem 'self'` covers
your bundles but not an inline `<script>`, so either give those a nonce or stay in safe mode
until the report-only policy shows what the site actually loads.

Fronting a platform that is not Pages? [cloudflare-workers-tardisec-examples](../cloudflare-workers-tardisec-examples)
is the zone-level version, and it serves the verification file too.

Nothing loads `.tardisec.cloudflare-pages-functions.js`: Pages runs `functions/_middleware.js`.
The synced copy inlines the header values instead of reading the manifest, so it is the
reference, not the live file.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one
of the files actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that code can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim; Pages serves static files, so sync it
straight into your build output directory with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
