use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use tfhe::{FheUint8, set_server_key};
use tfhe::prelude::*;
use crate::AppState;

#[derive(Deserialize)]
pub struct SubRequest {
    pub a: u8,
    pub b: u8,
}

#[derive(Serialize)]
pub struct SubResponse {
    pub result: u8,
}

pub async fn sub_handler(
    State(state): State<AppState>,
    Json(payload): Json<SubRequest>,
) -> Json<SubResponse> {
    set_server_key((*state.server_key).clone());
    
    let encrypted_a = FheUint8::encrypt(payload.a, &*state.client_key);
    let encrypted_b = FheUint8::encrypt(payload.b, &*state.client_key);
    
    let encrypted_result = &encrypted_a - &encrypted_b;
    let result: u8 = encrypted_result.decrypt(&*state.client_key);
    
    Json(SubResponse { result })
}

