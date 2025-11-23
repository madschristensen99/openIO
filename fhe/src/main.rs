mod fhe;

fn main() {
    println!("🚀 FHE Key Generation Server");
    println!("============================\n");

    match fhe::key_gen::generate_and_save_keys() {
        Ok(_) => {
            println!("\n✨ Key generation complete!");
            println!("\nNext steps:");
            println!("  1. Keys are saved in the 'keys/' directory");
            println!("  2. You can now use these keys for FHE operations");
            println!("  3. Run 'cargo run' again to verify keys exist");
        }
        Err(e) => {
            eprintln!("❌ Error: {}", e);
            std::process::exit(1);
        }
    }
}

