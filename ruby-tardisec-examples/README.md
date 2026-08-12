# Ruby × tardisec

Drop-in files for wiring a Rack app to its synced tardisec config. Copy `middleware.rb` into
your app; the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `tardisec_middleware.rb` | The Rack middleware, taking the parsed manifest as a constructor argument |
| `config.ru` | Wiring only. The two lines to drop into your own `config.ru` |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Rack 3 changed response header keys to lowercase-only, matching HTTP/2 semantics; a key like
`Content-Type` now fails `Rack::Lint` with `uppercase character in header name`.
`Tardisec::Middleware::HEADERS` downcases the manifest's keys once at load time, and `call`
downcases the app's own header keys before comparing, so the "already set" guard holds even
against an app that has not been updated for Rack 3 yet. Rack 3 also ships `Rack::Headers`, a
hash subclass that downcases on every write for you; this middleware downcases explicitly
instead, so the casing rule stays visible in the diff rather than hidden behind a class most
Rack docs do not mention.

`use Tardisec::Middleware` in your own `config.ru`, ahead of `run YourApp`, the same way
`demo_app` is wired here through `Rack::Builder`. Rack runs `call` on middleware in
registration order on the way in and unwinds in reverse on the way out, so registering it first
means it sees the final response, including one your app builds without ever touching this
file.

`APP`, built at the bottom with `Rack::Builder`, is the demo: a plain Rack app object
(`.call(env)`), the same shape `Rack::Builder.new { ... }.to_app` always returns. Hand it to
any Rack handler directly, for example `Rack::Handler::Puma.run(APP, Port: 3000)` from a
`require_relative "middleware"` script, or copy the `use`/`run` two-liner into your own
`config.ru` and point `rackup` at that instead.

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
