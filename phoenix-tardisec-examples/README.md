# Phoenix × tardisec

Drop-in files for wiring a Phoenix app to its synced tardisec config. Copy them into your app;
the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `lib/tardisec_middleware.ex` | The `Plug`: applies `.tardisec.json`'s `http.headers` to the conn |
| `lib/endpoint.ex` | Wiring only. Where in the endpoint the plug goes, and why there |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

The plug is the same file as in [plug-tardisec-examples](../plug-tardisec-examples), because
Phoenix is a Plug pipeline underneath. Two things are Phoenix-specific, and both matter.

**Mount it in the endpoint, above `Plug.Static`.** `lib/my_app_web/endpoint.ex`, not the router
and not a pipeline in it. A router pipeline only runs for routes that match, so a 404, a
LiveView socket response, or anything `Plug.Static` serves would miss the headers entirely.
`Plug.Static` halts once it answers, and a halt keeps what is already on `conn.resp_headers`, so
going above it is what covers your assets.

**`put_secure_browser_headers` overlaps and runs later.** Phoenix's generated `:browser`
pipeline calls it, and it sets `content-security-policy` (a bare `base-uri 'self'` in recent
generators), `x-frame-options`, `x-content-type-options`, `x-permitted-cross-domain-policies`
and `referrer-policy`. It runs in the router, after the endpoint, and it overwrites rather than
merges, so those come from Phoenix and the rest from tardisec, which is almost certainly not
what you want for the CSP. Drop the call from the pipeline, or pass it the map:
`put_secure_browser_headers(conn, %{})` still writes its defaults, so removing the plug is the
clean fix.

LiveView's websocket upgrade does not carry these headers, and does not need them; the initial
HTML render does, and it goes through the endpoint like any other request.

For the lowercase-key rule, the compile-time load and `@external_resource`, see the
[Plug directory's README](../plug-tardisec-examples).

No build-time CSP hashing, so the enforce CSP ships as-is. Phoenix templates with an inline
`<script>` need a nonce; `csp_nonce_assign_key` in the LiveView socket config is where that
lands if you use LiveView.

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
`.well-known/tardisec-verification.txt` verbatim, sync it straight into `priv/static/` with a
second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
