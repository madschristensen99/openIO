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
        .route("/sub", post(handlers::sub::sub_handler))
        .route("/mul", post(handlers::mul::mul_handler))
        .route("/div", post(handlers::div::div_handler))
        .route("/add64", post(handlers::add64::add64_handler))
        .route("/sub64", post(handlers::sub64::sub64_handler))
        .route("/mul64", post(handlers::mul64::mul64_handler))
        .route("/div64", post(handlers::div64::div64_handler))
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    println!("✅ Server running on http://{}", addr);
    println!("📡 Endpoints:");
    println!("   POST /add, /sub, /mul, /div (u8)");
    println!("   POST /add64, /sub64, /mul64, /div64 (u64)\n");
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

