# Laravel × tardisec

Drop-in files for wiring a Laravel app to its synced tardisec config. Copy them into your app;
the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `TardisecHeaders.php` | The loader: decodes `.tardisec.json` once and returns `http.headers` |
| `LaravelMiddleware.php` | The middleware: adds any header the response does not already have |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Register it globally, in `bootstrap/app.php` on Laravel 11+:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\Tardisec\LaravelMiddleware::class);
})
```

On Laravel 10 and earlier, add the class to the `$middleware` array in `app/Http/Kernel.php`.
Either way it belongs in the global stack rather than a route group, or the headers stop at the
routes you remembered. Appending puts it outermost on the way back out, so it sees the finished
response, including one the exception handler produced.

Laravel's `Response` wraps Symfony's `HeaderBag`, so `has()` and `set()` are the whole
integration, and anything the app set itself is left alone.

Running a Laravel-based CMS or shop rather than your own app? Statamic and Bagisto have their
own packages, which also serve the well-known verification file:
[tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template).

On Symfony or a PSR-15 pipeline instead?
[symfony-tardisec-examples](../symfony-tardisec-examples) and
[psr15-tardisec-examples](../psr15-tardisec-examples) share this loader and differ only in the
integration point.

**Headers must be set before output starts.** The middleware runs after the handler and before
PHP flushes, which is the right point. If your app echoes anything early, or runs with
`output_buffering` off and prints before returning the response, `header()` is already too late
and PHP warns "headers already sent".

No build-time CSP hashing, so the enforce CSP ships as-is. Any Blade view with an inline
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
