# Plug × tardisec

Drop-in files for wiring a Plug app to its synced tardisec config. Plug is the specification
every Elixir web stack sits on, so this is the generic case: `Plug.Router`, `Plug.Builder`, or
anything mounted straight on Bandit or Cowboy. Copy them into your app; the `.tardisec.*` files
are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `lib/tardisec_middleware.ex` | The `Plug`: applies `.tardisec.json`'s `http.headers` to the conn |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

On Phoenix? The plug is the same file, but the mount point and one header conflict are not:
[phoenix-tardisec-examples](../phoenix-tardisec-examples).

Mount it with `plug TardisecPlug` ahead of anything that can end the pipeline early. A plug that
halts keeps whatever is already on `conn.resp_headers`, so mounting before `Plug.Static` covers
the files it serves, while mounting after it would only ever reach requests that fall through.
This file ships flat and un-namespaced to match the other examples here; in a real app you would
nest it under your own namespace.

**Header keys must be lowercase, and this is enforced, not just stylistic.** HTTP/1.1
tolerates any casing, but HTTP/2 does not (RFC 7540 8.1.2 requires lowercase field names),
and an h2 client drops a response with mixed-case headers outright rather than normalizing
it. Plug's test adapter raises `Plug.Conn.InvalidHeaderError` on a mixed-case key specifically
so this surfaces in `mix test` instead of as a silently dropped response later. The manifest's
keys are Title-Case (`Content-Security-Policy`, `X-Frame-Options`), so `TardisecPlug` downcases
each one before comparing it against what's already on the conn or writing it.

**Loaded at compile time, not per request.** The plug reads and decodes `.tardisec.json` in a
module attribute, via `File.read!/1` and `Jason.decode!/1`, so the map is built once when the
module compiles rather than parsed on every request. `@external_resource` is what makes that
safe across recompiles: it tells `mix compile` that this module depends on the manifest file,
so editing `.tardisec.json` (as the sync workflow does) triggers a recompile of this module
too. Without it, a stale header map can keep shipping until something else happens to touch
`tardisec_plug.ex`. Requires `{:jason, "~> 1.4"}`, or swap in `:json` from Elixir 1.18's
standard library if you would rather not add the dependency.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any HTML
you render with an inline `<script>` needs a nonce.

Written and hand-formatted against Plug's documented behavior; no local Elixir/Mix toolchain
was available to run `mix format --check-formatted` or `mix compile` against it, so treat the
formatting as best-effort until you've run those in your own project.

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
