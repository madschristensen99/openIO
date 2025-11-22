import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface DeploymentRequest {
  code: string;
  config: {
    memory_limit: number;
    compute_timeout: number;
    enable_network: boolean;
  };
}

interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  endpoint?: string;
  error?: string;
  timestamp: Date;
}

const deployments = new Map<string, DeploymentStatus>();

export async function POST(request: NextRequest) {
  try {
    const body: DeploymentRequest = await request.json();
    
    if (!body.code || !body.code.trim()) {
      return NextResponse.json(
        { error: 'Code cannot be empty' },
        { status: 400 }
      );
    }

    const deploymentId = generateDeploymentId();
    
    deployments.set(deploymentId, {
      id: deploymentId,
      status: 'pending',
      timestamp: new Date(),
    });

    // Start async deployment
    deployToPhala(deploymentId, body);

    return NextResponse.json({
      deploymentId,
      status: 'pending',
      message: 'Deployment started',
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get('id');

  if (!deploymentId || !deployments.has(deploymentId)) {
    return NextResponse.json(
      { error: 'Deployment not found' },
      { status: 404 }
    );
  }

  const status = deployments.get(deploymentId)!;
  return NextResponse.json(status);
}

async function deployToPhala(deploymentId: string, request: DeploymentRequest) {
  try {
    deployments.set(deploymentId, {
      ...deployments.get(deploymentId)!,
      status: 'building'
    });

    // Create temporary directory
    const tempDir = path.join(process.cwd(), 'temp', deploymentId);
    await fs.mkdir(tempDir, { recursive: true });

    // Generate Rust project structure
    await generateRustProject(tempDir, request.code);

    // Build for TEE
    await buildForTEE(tempDir);

    // Deploy to Phala TEE
    const endpoint = await deployToTEE(tempDir, deploymentId);

    deployments.set(deploymentId, {
      ...deployments.get(deploymentId)!,
      status: 'deployed',
      endpoint
    });

    // Cleanup after successful deployment
    setTimeout(() => cleanup(tempDir), 60000);

  } catch (error) {
    console.error('Deployment failed:', error);
    deployments.set(deploymentId, {
      ...deployments.get(deploymentId)!,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generateRustProject(tempDir: string, code: string) {
  // Create project structure
  await Promise.all([
    // Cargo.toml
    fs.writeFile(
      path.join(tempDir, 'Cargo.toml'),
      `[package]
name = "fhe-app-${Date.now()}"
version = "0.1.0"
edition = "2021"

[dependencies]
tfhe = { version = "0.11.1", features = ["boolean", "shortint", "integer"] }
bincode = "1.3.3"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
log = "0.4"
env_logger = "0.10"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
`
    ),
    // src/main.rs
    fs.writeFile(
      path.join(tempDir, 'src', 'main.rs'),
      `use std::net::{TcpListener, TcpStream};
use std::io::{{Read, Write}};
use std::sync::{{Arc, Mutex}};
use serde::{{Deserialize, Serialize}};
use anyhow::Result;

${code}

#[derive(Serialize, Deserialize)]
struct Request {
    method: String,
    data: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
struct Response {
    success: bool,
    result: Option<serde_json::Value>,
    error: Option<String>,
}

fn main() -> Result<()> {
    env_logger::init();
    println!("🚀 FHE Application Started in TEE");

    let listener = TcpListener::bind("0.0.0.0:8080")?;
    println!("🎯 Listening on 0.0.0.0:8080");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_connection(stream)?;
            }
            Err(e) => log::error!("Connection failed: {}", e),
        }
    }
    Ok(())
}

fn handle_connection(mut stream: TcpStream) -> Result<()> {
    let mut buffer = [0; 4096];
    let bytes_read = stream.read(&mut buffer)?;
    
    if bytes_read == 0 {
        return Ok(());
    }

    let request_str = std::str::from_utf8(&buffer[..bytes_read])?;
    let request: Request = serde_json::from_str(request_str)?;

    let response = match request.method.as_str() {
        "process" => {
            let result = process_request(request.data)?;
            Response {
                success: true,
                result: Some(result),
                error: None,
            }
        }
        _ => Response {
            success: false,
            result: None,
            error: Some("Invalid method".to_string()),
        },
    };

    let response_json = serde_json::to_string(&response)?;
    stream.write_all(response_json.as_bytes())?;
    
    Ok(())
}

fn process_request(request_data: serde_json::Value) -> Result<serde_json::Value> {
    // TODO: Add actual FHE processing logic here
    Ok(serde_json::json!({{
        "processed": true,
        "data": request_data
    }}))
}
`
    ),
  ]);

  // Create src directory
  await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
}

async function buildForTEE(tempDir: string) {
  const { stdout, stderr } = await execAsync(
    `docker run --rm -v "${tempDir}:/app" -w /app rust:1.75-slim cargo build --release`,
    { timeout: 300000 }
  );
  
  if (stderr) {
    console.log('Build output:', stderr);
  }
}

async function deployToTEE(tempDir: string, deploymentId: string): Promise<string> {
  // Simulate deployment to TEE
  // In production, this would integrate with actual TEE deployment APIs
  
  const endpoint = `https://tee-execution.network/app-${deploymentId}`;
  
  // Add artificial delay for simulation
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return endpoint;
}

async function cleanup(tempDir: string) {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

function generateDeploymentId(): string {
  return `fhe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}