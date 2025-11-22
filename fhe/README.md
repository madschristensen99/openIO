# FHE Key Generation Server

A minimal starter server for Fully Homomorphic Encryption (FHE) key generation using TFHE-rs.

## What This Does

This project generates the cryptographic keys needed for FHE operations:
- **Client Key**: Used to encrypt and decrypt data (keep this secret!)
- **Server Key**: Used to perform homomorphic operations on encrypted data
- **Public Key**: Can be shared publicly for encryption

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable version)
- Cargo (comes with Rust)

### Generate Keys

```bash
# Build and run
cargo run

# Or build first, then run
cargo build --release
./target/release/fhe
```

The first run will:
1. Create a `keys/` directory
2. Generate FHE keys (this takes a few seconds)
3. Save keys as binary files:
   - `keys/client_key.bin`
   - `keys/server_key.bin`
   - `keys/public_key.bin`

Subsequent runs will detect existing keys and skip generation.

## Project Structure

```
fhe/
├── src/
│   ├── main.rs          # Entry point
│   └── fhe/
│       ├── mod.rs       # Module exports
│       └── key_gen.rs   # Key generation logic
├── Cargo.toml           # Dependencies
└── README.md            # This file
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit the `keys/` directory to version control
- The client key can decrypt all encrypted data - keep it secure!
- The `.gitignore` file excludes keys by default

## Next Steps

Once keys are generated, you can:
1. Add encryption/decryption functions
2. Build a server to handle FHE operations
3. Create client applications that use the public key

## Dependencies

- **tfhe** (0.11.1): Fully Homomorphic Encryption library
- **bincode** (1.3.3): Binary serialization for key storage
- **serde** (1.0): Serialization framework

## Troubleshooting

**Issue**: "Failed to generate keys"
- Make sure you have enough disk space
- Check that you have write permissions in the project directory

**Issue**: Build errors
- Run `rustup update` to ensure you have the latest Rust
- Try `cargo clean` then `cargo build` again

## License

MIT

