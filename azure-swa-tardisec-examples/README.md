# Azure Static Web Apps × tardisec

The synced tardisec config as `globalHeaders` in `staticwebapp.config.json`. No application code.

| File | What it does |
| --- | --- |
| `staticwebapp.config.json` | What SWA reads. Merge the synced `globalHeaders` block into it |
| `.tardisec.azure-swa.json` | Synced. The `globalHeaders` block, ready to merge |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

The file here carries only routing, so there is nothing to keep in step by hand: copy the
synced file's `globalHeaders` key into it when the sync PR lands. SWA reads
`staticwebapp.config.json` from the app artifact at deploy time, so a build step cannot
substitute it in late.

## Verify with curl, not with a green deploy

SWA drops some response headers silently. The deploy succeeds, the file is valid, the portal
shows nothing wrong, and the header never reaches the browser. `Permissions-Policy` is the one
users report as never appearing; assume any header can be treated this way rather than assuming
this is the only one.

So check the result rather than the config:

```sh
curl -sI https://example.com | sort
```

Anything missing from that output is a header SWA declined. Front the app with your own CDN if
you need one it drops, or accept the gap and record it: what tardisec scans is what the browser
receives, so a dropped header shows up as an unmet recommendation either way.

`globalHeaders` applies to every route. A per-route `headers` block overrides it wholesale for
that route rather than merging, so a route with its own headers loses the whole map, not just
the keys it names.

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
`.well-known/tardisec-verification.txt` verbatim; SWA serves static files, so sync it straight
into your app artifact directory with a second action block.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
