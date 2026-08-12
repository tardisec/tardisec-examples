# AWS Amplify Hosting × tardisec

The synced tardisec config as Amplify's `customHttp.yml`. No application code, and nothing to
hand-write: the served file is the platform's config file.

| File | What it does |
| --- | --- |
| `.tardisec.amplify.yml` | Synced. The `customHttp.yml` body, ready to copy |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Amplify reads `customHttp.yml` from the root of the repository the branch builds from, so copy
the synced file over it when the sync PR lands:

```sh
cp .tardisec.amplify.yml customHttp.yml
```

A build step cannot do it for you. Custom headers are part of the app's deploy configuration
rather than build output, and the Amplify console's own Custom headers screen edits the same
setting, so a value set there and a committed `customHttp.yml` are the same field: whichever was
written last wins. Pick one, and if you pick the file, leave the console screen empty.

`pattern: '**'` matches every path. Amplify merges patterns rather than taking only the first
match, so a narrower pattern of your own adds to this rather than replacing it, and two patterns
setting the same header on the same path is the one case to avoid.

No build-time CSP hashing, so the enforce CSP ships as-is. `script-src-elem 'self'` covers your
bundles but not an inline `<script>`; give those a nonce, or stay in safe mode until the
report-only policy shows what the site actually loads.

An Amplify app with a server-side runtime (Next.js SSR) sets headers from the app as well; the
framework directory for it applies there, and this file covers what Amplify serves directly.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one of
the files actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the config can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim; Amplify serves static files, so sync it
straight into your build output directory with a second action block.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
