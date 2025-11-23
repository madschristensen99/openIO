use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use tfhe::{FheUint64, set_server_key};
use tfhe::prelude::*;
use crate::AppState;

#[derive(Deserialize)]
pub struct Mul64Request {
    pub a: u64,
    pub b: u64,
}

#[derive(Serialize)]
pub struct Mul64Response {
    pub result: u64,
}

pub async fn mul64_handler(
    State(state): State<AppState>,
    Json(payload): Json<Mul64Request>,
) -> Json<Mul64Response> {
    set_server_key((*state.server_key).clone());
    
    let encrypted_a = FheUint64::encrypt(payload.a, &*state.client_key);
    let encrypted_b = FheUint64::encrypt(payload.b, &*state.client_key);
    
    let encrypted_result = &encrypted_a * &encrypted_b;
    let result: u64 = encrypted_result.decrypt(&*state.client_key);
    
    Json(Mul64Response { result })
}

