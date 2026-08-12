# Firebase Hosting × tardisec

The synced tardisec config as the `headers` array in `firebase.json`. No application code.

| File | What it does |
| --- | --- |
| `firebase.json` | What the CLI reads. Merge the synced `headers` array into `hosting` |
| `.tardisec.firebase.json` | Synced. The `headers` array, ready to merge |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

The file here carries only `public`, `ignore` and `rewrites`, so there is nothing to keep in
step by hand: copy the synced file's `headers` array into the `hosting` object when the sync PR
lands. `firebase deploy --only hosting` is what applies it; the headers are part of the hosting
release, not something the CDN picks up separately.

The `source` glob is `**`, which matches every path, so the map applies site-wide. Firebase
applies **only the first matching `headers` entry** for a given path rather than merging them,
so a narrower entry of your own above this one replaces the whole map for the paths it matches,
not just the keys it names. Put the tardisec entry first, or repeat what you need in yours.

Headers apply to what Hosting serves. A Cloud Function or Cloud Run service behind a rewrite
sets its own headers on its own responses, so apply the map there too if you have one.

No build-time CSP hashing, so the enforce CSP ships as-is. `script-src-elem 'self'` covers your
bundles but not an inline `<script>`; give those a nonce, or stay in safe mode until the
report-only policy shows what the site actually loads.

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
`.well-known/tardisec-verification.txt` verbatim; Hosting serves static files, so sync it
straight into your `public` directory with a second action block.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
