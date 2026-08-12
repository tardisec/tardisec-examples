# FastAPI × tardisec

Drop-in files for wiring a FastAPI app to its synced tardisec config. Copy them into your app;
the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisec_middleware.py` | The ASGI middleware, taking the parsed manifest as a constructor argument |
| `app.py` | Wiring only. Loads the manifest and registers the middleware |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

FastAPI is Starlette underneath, so this directory and
[starlette-tardisec-examples](../starlette-tardisec-examples) differ in exactly one thing: the
app class. `add_middleware` is inherited, the middleware file is identical, and everything the
Starlette README says about ordering applies here unchanged. Take whichever directory matches
the import you already have.

```python
app = FastAPI()
app.add_middleware(TardisecMiddleware, tardisec=TARDISEC)
```

**Do not reach for `@app.middleware("http")`.** It is FastAPI's own decorator sugar, it builds a
`BaseHTTPMiddleware`, and that class breaks streaming responses and background tasks in ways a
plain ASGI middleware does not. This one is plain ASGI, so it stays out of that.

`/docs` and `/redoc` are served by FastAPI like any other route, so they get the headers too.
Swagger UI loads its CSS and JS from a CDN by default, which the enforce CSP's `script-src-elem
'self'` will block. Either self-host those assets (`swagger_ui_parameters`), or leave the domain
in safe mode until the report-only policy tells you what it wants.

For the ASGI mechanics and the WSGI alternative, see the
[ASGI directory's README](../asgi-tardisec-examples).

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
