# TanStack Start × tardisec

Drop-in files for wiring TanStack Start to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `src/tardisecMiddleware.ts` | The middleware, plus why it sets one header at a time |
| `src/start.ts` | Wiring only. Registers it as global request middleware |
| `src/.tardisec.tanstack-start.ts` | Synced. The API's own version of `src/start.ts` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`src/start.ts` isn't in the default template; create it to register global request
middleware, which runs for every request including SSR and server functions.

**Two things to know before trusting this.** `setResponseHeaders(new Headers(...))` is
reported not to apply from global request middleware
([TanStack/router#5407](https://github.com/TanStack/router/issues/5407)), so this sets one
header at a time. Check they actually land on a real response, and fall back to your host
(`.tardisec.nginx.conf` / `.tardisec.caddyfile`) if they don't. And creating `src/start.ts`
opts you out of Start's automatic CSRF middleware for server functions, so add
`createCsrfMiddleware()` if you were relying on the default.

Don't also list this middleware on a server function's `.middleware([...])`: registered in
both places it runs more than once per request
([#5239](https://github.com/TanStack/router/issues/5239)).

No build-time CSP hashing, so the enforce CSP ships as-is and inline `<script>` needs a nonce.

Nothing loads `src/.tardisec.tanstack-start.ts`: TanStack Start reads `src/start.ts`. It is
synced into `src/` because that is where its `../.tardisec.json` import resolves from.

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
