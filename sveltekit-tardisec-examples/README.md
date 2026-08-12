# SvelteKit × tardisec

Drop-in files for wiring SvelteKit to its synced tardisec config. Copy them into your app; the
`.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `svelte.config.js` | Feeds `.tardisec.sveltekit.json` into `kit.csp`. Kit hashes inline scripts and styles at build time |
| `src/tardisecMiddleware.js` | The middleware: the header map, the `X-Sveltekit-Page` strip, the trusted-types append |
| `src/hooks.server.js` | Wiring only. Imports the manifest, hands it to the middleware |
| `.tardisec.sveltekit.json` | Synced. CSP only, in Kit's own `directives` / `reportOnly` shape |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

The two are deliberately split: CSP needs build-time hashes, so it can only come from
`svelte.config.js`. The hook skips any header the response already carries, which is what
keeps it from clobbering the CSP Kit just emitted.

The one exception is `require-trusted-types-for`. Kit errors out unless a `trusted-types`
allowlist exists at build time, so the synced file omits the directive and the hook appends
it to Kit's header instead.

The hook also deletes `X-Sveltekit-Page`. Kit stamps that on every rendered page as an
internal marker for its adapters; a browser has no use for it, and it announces the framework
to anyone reading response headers. Nothing in the manifest asks for its removal, so removing
it has to happen here.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when
one of the files actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that code can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim out of `static/`, sync it straight there
with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
