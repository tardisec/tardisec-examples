# Cloudflare Pages `_headers` × tardisec

The synced header map as the `_headers` file a static Cloudflare Pages project serves. No
Functions, no Worker, no application code.

| File | What it does |
| --- | --- |
| `.tardisec.cloudflare.headers` | Synced. The whole header map in `_headers` syntax |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`_headers` belongs in the build output directory, which the build wipes, so copy it there
afterwards. Make the project's build command
`npm run build && cp .tardisec.cloudflare.headers dist/_headers`, with `dist` replaced by
whatever your framework publishes. Everything in the map ships, enforce CSP included.

`_headers` only covers static output. A project with any Function needs
[cloudflare-pages-functions-tardisec-examples](../cloudflare-pages-functions-tardisec-examples)
instead, which covers both. The same file syntax is Netlify's, so
[netlify-tardisec-examples](../netlify-tardisec-examples) is this directory with a
`netlify.toml`.

No build-time CSP hashing, so `script-src-elem 'self'` covers your bundles but not an inline
`<script>`. Give those a nonce, or stay in safe mode until the report-only policy shows what
the site actually loads.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one
of the files actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the file can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim; Pages serves static files, so sync it
straight into your build output directory with a second action block.

The checked-in file is generated for `example.com` with a few confirmed allow-rules; yours
differs by domain, remediation mode, and what tardisec has observed.
