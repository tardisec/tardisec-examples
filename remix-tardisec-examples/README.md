# Remix / React Router 7 × tardisec

Drop-in files for wiring Remix / React Router 7 to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `app/tardisecMiddleware.ts` | The middleware: applies the header map to a `Headers` object |
| `app/entry.server.tsx` | Wiring only. One place every document response passes through |
| `app/.tardisec.remix.tsx` | Synced. The API's `headers` export for `app/root.tsx` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Also applies to React Router 7 in framework mode, same `entry.server` hook, different
import specifier.

**Why `entry.server` and not root's `headers` export:** in Remix the deepest matching route's
`headers` export wins, so a root-level one silently stops applying the day any leaf defines
its own. `entry.server` is one place every document response passes through. Route `headers`
exports still merge on top, and the `!responseHeaders.has(key)` check lets them win.

No build-time CSP hashing here, so the enforce CSP ships as-is, so inline `<script>` in your
root needs a nonce or a move into a file. Loader/action data requests and resource routes
don't go through `entry.server`; they don't render HTML, but if you serve documents from one,
apply the map there too.

Nothing loads `app/.tardisec.remix.tsx`: Remix reads `app/root.tsx`. It is synced into `app/`
because that is where its `../.tardisec.json` import resolves from.

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
