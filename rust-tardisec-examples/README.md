# Rust (Axum) × tardisec

Drop-in files for wiring an Axum service to its synced tardisec config. Copy them into your
app; the `.tardisec.*` files are then maintained by the sync, not by you.

| File | What it does |
| --- | --- |
| `src/tardisec_middleware.rs` | The middleware and the manifest parse |
| `src/main.rs` | Wiring only. Owns the `include_str!` path and layers the middleware on |
| `Cargo.toml` | `axum`, `tokio`, `serde_json`, pinned to what this example was checked against |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`include_str!(".tardisec.json")` bakes the manifest into the binary at compile time, so a
built artifact can never ship without it. The parse into a `HashMap<String, String>` runs
once, behind a `std::sync::LazyLock`, deferred to first use rather than running before
`main`. `LazyLock` has been stable since Rust 1.80 (mid-2024); reach for `once_cell` instead
only if your MSRV predates that.

`HeaderName::from_bytes` and `HeaderValue::from_str` both return `Result`. A manifest is
generated data, not literal Rust, so nothing guarantees its strings are valid HTTP header
bytes at compile time the way a `HeaderName` constant would be. The middleware matches on
both explicitly and skips (with an `eprintln!`) rather than unwrapping. An `unwrap` here would
turn one bad header into a panic that takes the whole request down, or the whole process if it
happened outside a caught panic boundary; a JSON manifest is exactly the kind of input where
that byte can appear.

`middleware::from_fn` runs the handler first (`next.run(request).await`) and applies headers
to the response afterward, so `response.headers().contains_key(...)` sees anything a handler
already set. Layer it near the root of the `Router` so it wraps every route, including one
that builds its response with a status code and no body.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for a JSON API, but any HTML
you render with an inline `<script>` needs a nonce.

Checked with `cargo fmt --check`, `cargo check`, and `cargo clippy --all-targets -- -D
warnings` against `axum` 0.8.9, `tokio` 1.53.1, and `serde_json` 1.0.151, the latest versions
on crates.io at the time this was written.

## Other frameworks

Axum is a tower service, so this parse plus `tower-http`'s `SetResponseHeaderLayer` applies the
same headers on anything else built on tower: tonic, or hyper behind a `ServiceBuilder`.

**actix-web** is not tower-based. Its middleware is a `Transform`, or a closure through
`wrap_fn`, over a `ServiceResponse` rather than an `http::Response`, so `parse` carries over
unchanged but the wrapper has to be rewritten.

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
