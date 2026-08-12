# Nuxt × tardisec

Drop-in files for wiring Nuxt to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `nuxt.config.ts` | Feeds `.tardisec.nuxt.json` into nuxt-security, which injects the inline hashes/nonce |
| `server/utils/tardisecMiddleware.ts` | The middleware: the header map minus the enforce CSP. Not in `server/middleware/`, which Nitro auto-registers |
| `server/middleware/tardisec.ts` | Wiring only. The file Nitro picks up |
| `.tardisec.nuxt.json` | Synced. CSP only, in nuxt-security's `security.headers.contentSecurityPolicy` shape |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Needs [nuxt-security](https://nuxt-security.vercel.app). It owns the enforce CSP because it
is the only piece that can inject the inline script/style hashes; the middleware drops
`Content-Security-Policy` so the map's hash-less copy can't intersect with it.

nuxt-security also ships its own defaults for HSTS, `X-Frame-Options`, `Referrer-Policy` and
friends. Where its default and the manifest disagree, set that header's
`security.headers.<camelCaseName>: false` in `nuxt.config.ts` and let the manifest own it.

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
