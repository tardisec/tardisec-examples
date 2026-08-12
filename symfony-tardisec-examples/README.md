# Symfony × tardisec

Drop-in files for wiring a Symfony app to its synced tardisec config. Copy them into your app;
the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `TardisecHeaders.php` | The loader: decodes `.tardisec.json` once and returns `http.headers` |
| `SymfonySubscriber.php` | The subscriber on `kernel.response`, adding what the response lacks |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

With the default `autoconfigure: true` in `services.yaml`, implementing
`EventSubscriberInterface` is the whole registration; Symfony finds it and tags it. Without
autoconfiguration, tag the service `kernel.event_subscriber` by hand.

`kernel.response` fires for every response the kernel produces, including the ones the exception
listener builds, so a 500 page gets the headers too.

**Main request only.** Sub-requests, from ESI fragments or a `forward()`, never reach the
browser on their own and their headers are discarded, so the subscriber returns early on them.
Without that check you pay for the loop on every fragment render and change nothing.

On Laravel or a PSR-15 pipeline instead?
[laravel-tardisec-examples](../laravel-tardisec-examples) and
[psr15-tardisec-examples](../psr15-tardisec-examples) share this loader and differ only in the
integration point. Laravel's `Response` is Symfony's `HeaderBag` underneath, so that adapter's
body is identical to this one; only the hook differs.

Running Sylius, Pimcore, Contao or another Symfony-based CMS? Each has its own package, which
also serves the well-known verification file:
[tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template).

**Headers must be set before output starts.** `kernel.response` runs before the kernel sends,
which is the right point. If your app echoes anything early, or runs with `output_buffering` off
and prints before the response object is returned, `header()` is already too late and PHP warns
"headers already sent".

No build-time CSP hashing, so the enforce CSP ships as-is. Any Twig template with an inline
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
