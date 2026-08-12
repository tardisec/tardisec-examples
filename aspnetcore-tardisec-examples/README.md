# ASP.NET Core × tardisec

Drop-in files for wiring an ASP.NET Core app to its synced tardisec config: minimal APIs, MVC
and Razor Pages alike, since all three share one middleware pipeline, which is why they are one
directory here rather than three. Copy them into your app; the `.tardisec.*` files are then
maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `TardisecHeadersMiddleware.cs` | The middleware, taking the parsed header map as a constructor argument |
| `Program.cs` | Wiring only. Parses the manifest at startup and registers the middleware first |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

**`OnStarting`, not after `await next`.** Once the first byte of the body is written the
response has started, `Response.Headers` becomes read-only, and a write throws
`InvalidOperationException`. The `OnStarting` callback fires at exactly that boundary: after the
endpoint has set its own headers, before anything is flushed. Setting them after awaiting the
next delegate works right up until something streams a response, and then it throws in
production only.

**Register it first.** `app.UseMiddleware<TardisecHeadersMiddleware>(headers)` before static
files, the exception handler and the endpoints, so it wraps everything that can answer a
request, including the error page. Anything registered before it that short-circuits answers
without the headers.

The map is parsed once at startup with `System.Text.Json.Nodes`, not per request; the file only
changes via the sync workflow. `ContentRootPath` is where `.tardisec.json` is expected, so if
you deploy from `bin/` set `Copy to Output Directory` on the file, or point the read at the
content root you actually ship.

On .NET Framework rather than .NET? The pipeline does not exist there; the equivalent is an
`IHttpModule` on `PreSendRequestHeaders`, which is what
[tardisec-integration-dnn-module](https://github.com/tardisec/tardisec-integration-dnn-module)
does. Umbraco, Orchard Core and nopCommerce have their own packages; see
[tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template).

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any Razor
page with an inline `<script>` needs a nonce.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when the
file actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that code can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim, sync it straight into `wwwroot/` with a
second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
