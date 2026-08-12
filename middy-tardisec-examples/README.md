# Middy (AWS Lambda) × tardisec

Drop-in files for wiring Middy (AWS Lambda) to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisecMiddleware.js` | The middleware: merges `.tardisec.json`'s `http.headers` onto the response |
| `handler.js` | Wiring only. Where in the chain to register it, and why there |
| `.tardisec.middy.js` | Synced. The API's own version of the middleware |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

For Lambda behind API Gateway, an ALB, or a function URL, anywhere the response is a
`{statusCode, headers, body}` object.

**`onError` as well as `after`.** A thrown handler skips the `after` chain, so an
`after`-only middleware ships bare error responses, and an error page is still a page a
browser parses.

**Register it first.** Middy runs `after` and `onError` in reverse registration order, so
first-registered runs last and sees the response everything else has finished with. Register
it last and the next `after` in line can overwrite a security header.

Header comparison is case-insensitive because API Gateway response header keys are whatever
the handler typed. If you already use `@middy/http-security-headers`, drop it: the manifest
covers the same headers plus reporting, and two middlewares setting them race.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for JSON APIs, but a
Lambda returning HTML with inline `<script>` needs a nonce.

Nothing loads `.tardisec.middy.js`: it is a snippet, not a module, and it declares the
middleware without exporting it. Keep it as the upstream reference and diff it after a sync.

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
