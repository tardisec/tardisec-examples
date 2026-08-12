# Vercel × tardisec

The synced tardisec config as Vercel's `headers` rule, for any framework Vercel hosts. No
application code.

| File | What it does |
| --- | --- |
| `vercel.json` | What Vercel reads. The synced rule, committed under the name Vercel looks for |
| `.tardisec.vercel.json` | Synced. The same `headers` rule, ready to copy over `vercel.json` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Two files with the same body, because Vercel reads `vercel.json` and the sync writes
`.tardisec.vercel.json`. Run `cp .tardisec.vercel.json vercel.json` when the sync PR lands. A
build step cannot do it for you: `vercel.json` is deployment configuration, read before the
build runs, so a copy during the build is already too late.

Already have a `vercel.json`? Merge the `headers` key into it rather than replacing the file.
The rule matches `/(.*)`, so it applies to every path; a more specific rule of your own that
also matches wins, since Vercel applies the first match only.

Everything in the map ships, enforce CSP included. No build-time CSP hashing, so
`script-src-elem 'self'` covers your bundles but not an inline `<script>`. Give those a nonce,
or stay in safe mode until the report-only policy shows what the site actually loads.

`headers` covers what Vercel serves. A Next.js app on Vercel has its own
[nextjs-tardisec-examples](../nextjs-tardisec-examples) route through `next.config.js`, which
covers route handlers too; pick one, not both.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one
of the files actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the rule can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim; Vercel serves static files, so sync it
straight into `public/` with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
