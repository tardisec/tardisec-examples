# Netlify × tardisec

Drop-in files for applying the synced tardisec config on Netlify. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `.tardisec.netlify.headers` | Synced. The whole header map in `_headers` syntax |
| `netlify.toml` | Copies it into the publish directory after your build |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`_headers` belongs in the publish directory, which the build wipes, so the copy runs after the
build rather than the file being committed there. Everything in the map ships, enforce CSP
included.

The same file syntax is Cloudflare Pages', so
[cloudflare-tardisec-examples](../cloudflare-tardisec-examples) is this directory with the
build command set in the Pages dashboard instead of a `netlify.toml`.

No build-time CSP hashing, so `script-src-elem 'self'` covers your bundles but not an inline
`<script>`. Give those a nonce, or stay in safe mode until the report-only policy shows what
the site actually loads.

`_headers` covers what Netlify serves. A Netlify Function returning its own response sets its
own headers, so apply the map there too.

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
`.well-known/tardisec-verification.txt` verbatim, sync it straight into your static directory
with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
