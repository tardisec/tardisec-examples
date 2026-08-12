# Vite SSR × tardisec

Drop-in files for wiring Vite SSR to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisecMiddleware.js` | The connect/Express middleware, taking the parsed manifest |
| `server.js` | Wiring only. Mounts it ahead of `vite.middlewares` |
| `.tardisec.vite-ssr.js` | Synced. The API's own version of the middleware |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

For a Vite server in `middlewareMode`, the hand-rolled SSR setup, not a meta-framework.
Mounted ahead of `vite.middlewares` so it covers assets and the SSR render alike.

Because it runs first, the `res.getHeader` guard only defers to middleware mounted above it.
Anything downstream can still overwrite a header, which is the escape hatch for a route that
needs its own.

This is the dev server. Your production server is a separate file: mount the same middleware
there, or apply the map at the host in front of it.

No build-time CSP hashing, so the enforce CSP ships as-is. Vite's dev client uses inline
scripts and a websocket, so expect `connect-src`/`script-src` violations locally that
production won't have. One more reason to keep the strict policy in report-only until it's
quiet.

Nothing loads `.tardisec.vite-ssr.js`: it is a snippet that assumes an `app` already in scope.
Keep it as the upstream reference and diff it after a sync.

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
`.well-known/tardisec-verification.txt` verbatim, sync it straight into your static
directory with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
