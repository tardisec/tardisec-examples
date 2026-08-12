# Bun × tardisec

Drop-in files for wiring a Bun server to its synced tardisec config. Copy them into your app;
the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisecMiddleware.js` | The middleware: a response wrapper, since Bun.serve has no chain |
| `server.js` | Wraps `Bun.serve`'s responses, applying `.tardisec.json`'s `http.headers` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`Bun.serve({ fetch })` has no middleware chain, so `withTardisecHeaders` wraps the `Response`
each route builds before it's returned. `response.headers` is a Fetch API `Headers` object,
so the already-set check is `.has()` and the write is `.set()`, both case-insensitive by
spec, and a handler that already set a header keeps it.

This only covers responses that go through `fetch`. Bun's `routes` option can serve a
`Response` directly for a path (its static-response fast path), and those never call `fetch`
at all, so they skip this wrapper too. Build those responses with `withTardisecHeaders` as
well, or apply the map at the host in front of Bun instead.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any HTML
you render with an inline `<script>` needs a nonce.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when
the file actually changed.

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
