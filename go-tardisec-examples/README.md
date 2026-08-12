# Go × tardisec

Drop-in files for wiring a Go `net/http` server to its synced tardisec config. Copy them into
your app; the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisec_middleware.go` | The middleware, plus the `Manifest` shape it needs |
| `main.go` | Wiring only. Embeds and parses the manifest, wraps the mux |
| `go.mod` | Needed for `go build`; the `go:embed` of a dotfile is the point of interest |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`main.go` embeds `.tardisec.json` straight into the binary with `//go:embed`. That directive
normally skips files whose name starts with `.` or `_`, but only when the pattern matches a
directory it walks recursively; naming the file itself, as `//go:embed .tardisec.json` does
here, embeds it unaffected by that rule. Confirmed against go1.26 before writing this.

The header map decodes into a small struct with json tags rather than a bare `map[string]any`,
so a manifest shape change becomes a compile-time field mismatch instead of a silent lookup
miss. `map[string]string` iterates in random order in Go, which shows up when ranging over
`Headers`, but header order carries no meaning over HTTP, so that is harmless.

`http.Header.Get` and `.Set` canonicalize the key (`textproto.CanonicalMIMEHeaderKey`), so the
"already set" guard is case-insensitive regardless of how the manifest or a handler cased the
name. `tardisecHeaders` wraps the mux in `main`, so it runs before any route; a handler further
down the chain can still call `Set` again before writing the body to override a header, which
is the escape hatch for one that genuinely needs its own.

This file assumes it is dropped into an existing module, the same way the JS examples assume
`express` or `hono` is already in `package.json`; there is no `go.mod` here so the drop-in stays
limited to the files above.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any HTML you
render with an inline `<script>` needs a nonce.

## Other routers

`TardisecMiddleware` returns a `func(http.Handler) http.Handler`, the standard library's
middleware shape, so **chi** (`r.Use(...)`) and **gorilla/mux** (whose `MiddlewareFunc` is that
same type) take it unchanged, and **Echo** takes it through `echo.WrapMiddleware`, which adapts
exactly this type in one call.

**Gin** does not: its middleware is a `gin.HandlerFunc` written against `*gin.Context` rather
than `http.ResponseWriter`, with no adapter in the other direction. The loop body is the same;
only the wrapper changes. **Fiber** is further out again, since it is fasthttp rather than
`net/http`.

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
