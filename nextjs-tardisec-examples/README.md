# Next.js × tardisec

Drop-in files for wiring Next.js to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `next.config.js` | Returns `.tardisec.json`'s `http.headers` from `headers()` for every path |
| `.tardisec.nextjs.js` | Synced. The API's own `next.config.js`, same job as the one here |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

One file: Next has no framework-specific tardisec config because it has no build-time CSP
hashing, so the whole header map, enforce CSP included, ships verbatim from `headers()`.

**That matters for inline scripts.** `script-src-elem 'self'` covers your bundles, but Next's
inline bootstrap and any `<Script dangerouslySetInnerHTML>` are blocked by it. Either add a
nonce in middleware and rewrite the CSP header per-request
([Next's CSP guide](https://nextjs.org/docs/app/guides/content-security-policy)), or keep the
domain in safe mode until the report-only policy shows you what needs allowing. The
report-only header in the map is doing exactly that job in the meantime.

`headers()` covers pages and route handlers. It does not cover anything served outside Next
(a CDN error page, a redirect from your host), so apply the map at the edge too if you have one.

Nothing loads `.tardisec.nextjs.js`: Next reads `next.config.js`. It is the upstream reference,
pulled by the sync, so a diff after a sync shows what the API would write.

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
