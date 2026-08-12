# Gatsby × tardisec

Drop-in files for wiring Gatsby to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `gatsby-config.js` | `.tardisec.gatsby.json` as a `gatsby-plugin-csp` entry, plus the header map as `headers` |
| `.tardisec.gatsby.json` | Synced. A ready-made `plugins` entry: `resolve` + `options.directives` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Gatsby builds static output, so there is no runtime hook, so one config file does both jobs.

[gatsby-plugin-csp](https://www.gatsbyjs.com/plugins/gatsby-plugin-csp/) owns the enforce CSP:
it merges the inline script/style hashes into a `<meta>` tag at build time
(`mergeScriptHashes`/`mergeStyleHashes` are on in the synced options). The header map's
hash-less copy is dropped so it can't intersect with that policy and block those scripts.

`headers` needs `gatsby@5.12`+ and a host that honours it (`gatsby-adapter-netlify`, Vercel,
…). `gatsby serve` and unsupported hosts ignore it, so apply the map at the host there,
`.tardisec.nginx.conf` / `.tardisec.caddyfile` are drop-ins.

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
