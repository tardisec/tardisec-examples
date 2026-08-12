# Starlette × tardisec

Drop-in files for wiring a Starlette app to its synced tardisec config. Copy them into your app;
the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisec_middleware.py` | The ASGI middleware, taking the parsed manifest as a constructor argument |
| `app.py` | Wiring only. Loads the manifest and registers the middleware |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

The middleware file here is the same one as in
[asgi-tardisec-examples](../asgi-tardisec-examples), because Starlette speaks plain ASGI. What
differs is one line of wiring:

```python
app.add_middleware(TardisecMiddleware, tardisec=TARDISEC)
```

`add_middleware` instantiates the class per app with the keyword arguments given, rather than
you wrapping the app yourself. Position matters, and it is the reverse of what most people
expect: middleware added later runs **further out**, so the last `add_middleware` call sees the
response last. Add this one first if you want another middleware to be able to override a header
it sets, last if you want tardisec's value to be the one that ships.

Starlette's own `ServerErrorMiddleware` sits outermost, above anything you add, so a response
from an unhandled exception is the one case these headers do not reach. Wire the map at the host
or CDN too if that page matters to you.

For the ASGI mechanics, the byte-typed header names, and the WSGI alternative, see the
[ASGI directory's README](../asgi-tardisec-examples). On FastAPI?
[fastapi-tardisec-examples](../fastapi-tardisec-examples), which differs from this one only in
the app class.

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
