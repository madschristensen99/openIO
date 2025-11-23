use std::fs;
use std::path::Path;
use tfhe::{ConfigBuilder, ClientKey, ServerKey, CompactPublicKey};
use tfhe::shortint::prelude::PARAM_MESSAGE_2_CARRY_2;
use tfhe::shortint::parameters::COMP_PARAM_MESSAGE_2_CARRY_2;

const KEYS_DIR: &str = "keys";
const CLIENT_KEY_PATH: &str = "keys/client_key.bin";
const SERVER_KEY_PATH: &str = "keys/server_key.bin";
const PUBLIC_KEY_PATH: &str = "keys/public_key.bin";

pub fn generate_and_save_keys() -> Result<(), Box<dyn std::error::Error>> {
    println!("🔐 Checking for existing keys...");
    
    // Create keys directory if it doesn't exist
    if !Path::new(KEYS_DIR).exists() {
        fs::create_dir(KEYS_DIR)?;
        println!("📁 Created keys directory");
    }

    // Check if keys already exist
    if Path::new(CLIENT_KEY_PATH).exists() && 
       Path::new(SERVER_KEY_PATH).exists() &&
       Path::new(PUBLIC_KEY_PATH).exists() {
        println!("✅ Keys already exist. Skipping key generation.");
        println!("   Client key: {}", CLIENT_KEY_PATH);
        println!("   Server key: {}", SERVER_KEY_PATH);
        println!("   Public key: {}", PUBLIC_KEY_PATH);
        Ok(())
    } else {
        println!("🔑 Generating new FHE keys...");
        println!("   This may take a few moments...");
        
        // Configure TFHE with compression
        let config = ConfigBuilder::with_custom_parameters(PARAM_MESSAGE_2_CARRY_2)
            .enable_compression(COMP_PARAM_MESSAGE_2_CARRY_2)
            .build();
        
        // Generate keys
        let client_key = ClientKey::generate(config);
        let server_key = ServerKey::new(&client_key);
        let public_key = CompactPublicKey::new(&client_key);
        
        // Save keys
        save_client_key(&client_key)?;
        save_server_key(&server_key)?;
        save_public_key(&public_key)?;
        
        println!("✅ Keys generated and saved successfully!");
        println!("   Client key: {}", CLIENT_KEY_PATH);
        println!("   Server key: {}", SERVER_KEY_PATH);
        println!("   Public key: {}", PUBLIC_KEY_PATH);
        
        Ok(())
    }
}

fn save_client_key(key: &ClientKey) -> Result<(), String> {
    let buffer = bincode::serialize(key)
        .map_err(|e| format!("Failed to serialize client key: {}", e))?;
    fs::write(CLIENT_KEY_PATH, buffer)
        .map_err(|e| format!("Failed to save client key: {}", e))?;
    Ok(())
}

fn save_server_key(key: &ServerKey) -> Result<(), String> {
    let buffer = bincode::serialize(key)
        .map_err(|e| format!("Failed to serialize server key: {}", e))?;
    fs::write(SERVER_KEY_PATH, buffer)
        .map_err(|e| format!("Failed to save server key: {}", e))?;
    Ok(())
}

fn save_public_key(key: &CompactPublicKey) -> Result<(), String> {
    let buffer = bincode::serialize(key)
        .map_err(|e| format!("Failed to serialize public key: {}", e))?;
    fs::write(PUBLIC_KEY_PATH, buffer)
        .map_err(|e| format!("Failed to save public key: {}", e))?;
    Ok(())
}

pub fn load_client_key() -> Result<ClientKey, String> {
    let data = fs::read(CLIENT_KEY_PATH)
        .map_err(|e| format!("Failed to read client key: {}", e))?;
    
    bincode::deserialize(&data)
        .map_err(|e| format!("Failed to deserialize client key: {}", e))
}

pub fn load_server_key() -> Result<ServerKey, String> {
    let data = fs::read(SERVER_KEY_PATH)
        .map_err(|e| format!("Failed to read server key: {}", e))?;
    bincode::deserialize(&data)
        .map_err(|e| format!("Failed to deserialize server key: {}", e))
}

pub fn load_public_key() -> Result<CompactPublicKey, String> {
    let data = fs::read(PUBLIC_KEY_PATH)
        .map_err(|e| format!("Failed to read public key: {}", e))?;
    bincode::deserialize(&data)
        .map_err(|e| format!("Failed to deserialize public key: {}", e))
}

