mod fhe;
mod handlers;

use std::sync::Arc;
use axum::{Router, routing::post};
use tfhe::{ServerKey, ClientKey};

#[derive(Clone)]
pub struct AppState {
    server_key: Arc<ServerKey>,
    client_key: Arc<ClientKey>,
}

#[tokio::main]
async fn main() {
    println!("🚀 FHE Server Starting...\n");

    if let Err(e) = fhe::key_gen::generate_and_save_keys() {
        eprintln!("❌ Failed to generate keys: {}", e);
        return;
    }

    let state = AppState {
        server_key: Arc::new(fhe::key_gen::load_server_key().unwrap()),
        client_key: Arc::new(fhe::key_gen::load_client_key().unwrap()),
    };

    let app = Router::new()
        .route("/add", post(handlers::add::add_handler))
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    println!("✅ Server running on http://{}", addr);
    println!("📡 Endpoint: POST /add\n");
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

