import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const {
      contractName,
      sourceCode,
      constructorArgs = []
    }: { 
      contractName: string; 
      sourceCode: string;
      constructorArgs?: any[];
    } = await request.json();
    
    // Create temporary contract file
    const tempDir = join('/tmp', 'openio-deployment', Date.now().toString());
    mkdirSync(tempDir, { recursive: true });
    
    // Write contract source
    const contractPath = join(tempDir, `${contractName}.sol`);
    writeFileSync(contractPath, sourceCode);
    
    // Foundry deployment command
    const deploymentResult = await new Promise<any>((resolve, reject) => {
      const deployProcess = spawn('forge', [
        'create',
        contractPath,
        '--private-key', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        '--rpc-url', 'http://localhost:8545',
        '--constructor-args', ...constructorArgs
      ], {
        cwd: '/home/remsee/openIO/symbiotic'
      });
      
      let stderr = '';
      let stdout = '';
      
      deployProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      deployProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      deployProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            message: 'Deployment successful',
            address: extractAddress(stdout),
            txHash: extractTxHash(stdout),
            blockNumber: extractBlockNumber(stdout),
            output: stdout
          });
        } else {
          reject(new Error(`Deployment failed: ${stderr || stdout}`));
        }
      });
    });
    
    return NextResponse.json(deploymentResult);
    
  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error'
    }, { status: 500 });
  }
}

function extractAddress(output: string): string {
  const match = output.match(/Deployed to: (0x[a-fA-F0-9]{40})/);
  return match ? match[1] : '0x0000000000000000000000000000000000000000';
}

function extractTxHash(output: string): string {
  const match = output.match(/Transaction hash: (0x[a-fA-F0-9]{64})/);
  return match ? match[1] : '0x0000000000000000000000000000000000000000000000000000000000000000';
}

function extractBlockNumber(output: string): number {
  const match = output.match(/Block number: (\d+)/);
  return match ? parseInt(match[1]) : 0;
}