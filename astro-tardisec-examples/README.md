# Astro × tardisec

Drop-in files for wiring Astro to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `astro.config.mjs` | Spreads `.tardisec.astro.json` into `defineConfig`. Astro hashes inline scripts and styles at build time |
| `src/tardisecMiddleware.js` | The middleware: the header map minus the enforce CSP |
| `src/middleware.js` | Wiring only. The filename Astro loads |
| `.tardisec.astro.json` | Synced. CSP only, already shaped as `security.csp` so it spreads in as-is |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`security.csp` needs astro@6. On 5.9 through 5.x, move the same object to `experimental.csp`.

Astro emits its policy as a `<meta http-equiv>` tag rather than a header, so nothing stops
the header map's copy from being sent as well. It must not be: the map's copy carries no
hashes, so it would intersect with the meta policy and block the very scripts Astro just
hashed. That is why `src/middleware.js` drops `Content-Security-Policy`.
`Content-Security-Policy-Report-Only` still ships from the map, because a meta tag cannot
carry a report-only policy at all.

**Static output:** middleware runs at build time and its response headers are discarded, so
a `output: 'static'` site gets nothing from it. Apply the header map at your host instead.
`.tardisec.nginx.conf` and `.tardisec.caddyfile` are drop-ins, or use your CDN's header rules.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when
one of the files actually changed.

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
