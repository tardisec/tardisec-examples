# SolidStart × tardisec

Drop-in files for wiring SolidStart to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `src/tardisecMiddleware.ts` | The middleware: the `onBeforeResponse` handler |
| `src/middleware.ts` | Wiring only. The path `app.config.ts` registers |
| `app.config.ts` | Registers the middleware. Without this line none of it runs |
| `src/.tardisec.solidstart.ts` | Synced. The API's own version of `src/middleware.ts` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`onBeforeResponse`, so the headers land on the finished response rather than a request that
may still be rewritten.

The `middleware` entry in `app.config.ts` is the easy thing to miss: the file is inert until
it's registered.

No build-time CSP hashing, so the enforce CSP ships as-is and inline `<script>` needs a nonce.

Nothing loads `src/.tardisec.solidstart.ts`: `app.config.ts` registers `src/middleware.ts`. It
is synced into `src/` because that is where its `../.tardisec.json` import resolves from.

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
