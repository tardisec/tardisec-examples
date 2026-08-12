# ASGI × tardisec

Drop-in files for wiring any ASGI app to its synced tardisec config. ASGI is the interface, not
a framework, so this is the generic case: Quart, Litestar, Sanic, Django under ASGI, or a bare
callable like the one here. Copy `tardisec_middleware.py` into your app; the `.tardisec.*` files
are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisec_middleware.py` | The ASGI middleware, taking the parsed manifest as a constructor argument |
| `app.py` | Wiring only. Loads the manifest and wraps a bare ASGI app |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

On Starlette or FastAPI? They register middleware through `add_middleware` rather than by
wrapping, so they get their own directories:
[starlette-tardisec-examples](../starlette-tardisec-examples) and
[fastapi-tardisec-examples](../fastapi-tardisec-examples). The middleware file is the same one
in all three.

ASGI sends a response as two messages: `http.response.start` carries the status and headers,
`http.response.body` carries the body. `TardisecMiddleware` wraps `send`, and on
`http.response.start` appends any manifest header not already present. Header names there are
lowercase `bytes`, not `str`, so the manifest's `Content-Security-Policy` becomes
`b"content-security-policy"` before comparison; get the casing or the type wrong and the
"already set" check silently misses.

The manifest's headers are encoded once in `__init__`, not inside `__call__`, since the file
only changes via the sync workflow and re-encoding on every request would be wasted work.

Only `http` scopes are decorated. Lifespan and websocket scopes pass through untouched, since
neither carries a response with headers.

Using WSGI instead (Flask, Django outside its ASGI mode, or anything served by gunicorn's sync
workers)? The header list there is `[(str, str), ...]` handed to `start_response`, no byte
encoding and no lowercase requirement, so wrap `start_response` the same way rather than `send`.
Not shown here; the shape is different enough that copying this file over would just add bugs.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any HTML you
render with an inline `<script>` needs a nonce.

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
