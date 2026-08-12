use axum::{
    body::Body,
    extract::Request,
    http::{HeaderName, HeaderValue},
    middleware::Next,
    response::Response,
};
use serde_json::Value;
use std::collections::HashMap;

// include_str! bakes the manifest into the binary at compile time, so a deploy can never ship
// without it. Parsed on first use via the LazyLock in main.rs, which owns the path.
pub fn parse(manifest: &str) -> HashMap<String, String> {
    let manifest: Value =
        serde_json::from_str(manifest).expect(".tardisec.json must be valid JSON");
    // A malformed manifest is a build/deploy invariant, not a per-request condition, so this one
    // expect is fine; the per-header parsing below is the one that must not panic.
    serde_json::from_value(manifest["http"]["headers"].clone()).unwrap_or_default()
}

// Applies every header from the manifest that the handler has not already set. HeaderName and
// HeaderValue parsing both return Result, since a manifest value could contain bytes that are
// not legal in an HTTP header; skip and log rather than unwrap, which would take the whole
// process down over one bad entry instead of just dropping that header.
pub async fn tardisec_middleware(
    headers: &'static HashMap<String, String>,
    request: Request<Body>,
    next: Next,
) -> Response {
    let mut response = next.run(request).await;

    for (key, value) in headers.iter() {
        let name = match HeaderName::from_bytes(key.as_bytes()) {
            Ok(name) => name,
            Err(err) => {
                eprintln!("tardisec: skipping header {key:?}: {err}");
                continue;
            }
        };

        if response.headers().contains_key(&name) {
            continue;
        }

        match HeaderValue::from_str(value) {
            Ok(value) => {
                response.headers_mut().insert(name, value);
            }
            Err(err) => eprintln!("tardisec: skipping header {key:?}: {err}"),
        }
    }

    response
}
