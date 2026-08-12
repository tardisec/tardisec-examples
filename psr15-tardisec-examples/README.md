# PSR-15 × tardisec

Drop-in files for wiring a PSR-15 pipeline to its synced tardisec config. PSR-15 is an interface
standard, not a framework, so this is the generic case: Slim, Mezzio, Laminas, Yii, or any stack
that runs `MiddlewareInterface`. Copy them into your app; the `.tardisec.*` files are then
maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `TardisecHeaders.php` | The loader: decodes `.tardisec.json` once and returns `http.headers` |
| `Psr15Middleware.php` | The middleware: adds any header the response does not already have |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Add it to the pipeline outermost, so it also decorates error responses produced by middleware
inside it. In Slim that is `$app->add(...)` before the routing middleware; in Mezzio it is a
`pipe()` at the top of `config/pipeline.php`.

**PSR-7 is immutable, and this is the one thing to get right.** `withHeader()` returns a new
response and changes nothing in place, so the return value has to be reassigned:

```php
$response = $response->withHeader($name, $value);
```

Drop the assignment and every header silently disappears, with no error anywhere. This is the
only real difference from the Laravel and Symfony adapters, which share a mutable `HeaderBag`
where `set()` is enough. Copying a body from one to the other is exactly how this goes wrong:
[laravel-tardisec-examples](../laravel-tardisec-examples),
[symfony-tardisec-examples](../symfony-tardisec-examples).

**Headers must be set before output starts.** The middleware runs after the handler and before
the emitter writes, which is the right point. If your app echoes anything early, or runs with
`output_buffering` off, the emitter's `header()` calls are already too late and PHP warns
"headers already sent".

No build-time CSP hashing, so the enforce CSP ships as-is. Any template with an inline
`<script>` needs a nonce.

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
`.well-known/tardisec-verification.txt` verbatim, sync it straight into `public/` with a
second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
