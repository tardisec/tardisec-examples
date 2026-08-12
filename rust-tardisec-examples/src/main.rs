mod tardisec_middleware;

use axum::{Router, middleware, response::Html, routing::get};
use std::{collections::HashMap, sync::LazyLock};

// include_str! resolves relative to this file, so main.rs owns the manifest path. LazyLock
// defers the parse to first use rather than running it before main; stable since Rust 1.80,
// so no need for once_cell.
static TARDISEC_HEADERS: LazyLock<HashMap<String, String>> =
    LazyLock::new(|| tardisec_middleware::parse(include_str!("../.tardisec.json")));

async fn index() -> Html<&'static str> {
    Html("<!doctype html><title>ok</title>")
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(index))
        .layer(middleware::from_fn(|request, next| async move {
            tardisec_middleware::tardisec_middleware(&TARDISEC_HEADERS, request, next).await
        }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
