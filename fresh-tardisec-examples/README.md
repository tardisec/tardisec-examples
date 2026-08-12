# Deno Fresh × tardisec

Drop-in files for wiring Deno Fresh to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisecMiddleware.ts` | The middleware. At the project root, not in `routes/`, or Fresh would route it |
| `routes/_middleware.ts` | Wiring only. The underscore file Fresh applies site-wide |
| `routes/.tardisec.fresh.ts` | Synced. The API's own version of `routes/_middleware.ts` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

At `routes/` root, `_middleware.ts` runs for every route below it. Anything already on the
response wins, so a route that sets its own header keeps it.

Fresh has no build-time CSP hashing, but it doesn't need much: the islands bootstrap is an
external module that `script-src-elem 'self'` already covers. Inline `<script>` you add
yourself still needs a nonce.

Uses the Fresh 2 `define.middleware` helper from `utils.ts`. On Fresh 1, export a
`handler` function with the same body instead.

Nothing loads `routes/.tardisec.fresh.ts`: Fresh routes `_middleware.ts`, not a dotfile. It is
synced into `routes/` because that is where its `../.tardisec.json` import resolves from.

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
