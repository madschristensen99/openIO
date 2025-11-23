import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const { keyName, public: isPublic }: { keyName?: string; public?: boolean } = await request.json();
    
    const name = keyName || `fhe-keys-${Date.now()}`;
    
    // Create temporary directory for FHE key generation
    const tempDir = join(tmpdir(), 'fhe-generation', `${name}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    console.log(`Generating FHE keys in: ${tempDir}`);
    
    return new Promise((resolve, reject) => {
      const child = spawn('cargo', ['run'], {
        cwd: '/home/remsee/fheKeysOn0g/fhe',
        env: {
          ...process.env,
          KEYS_DIR: tempDir,
        },
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        stdout += str;
        console.log('FHE stdout:', str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        stderr += str;
        console.log('FHE stderr:', str);
      });

      child.on('close', async (code) => {
        if (code === 0) {
          try {
            // Read generated keys
            const keys = {
              clientKey: await fs.readFile(join(tempDir, 'client_key.bin'), 'base64'),
              serverKey: await fs.readFile(join(tempDir, 'server_key.bin'), 'base64'),
              publicKey: await fs.readFile(join(tempDir, 'public_key.bin'), 'base64'),
            };

            // Clean up the temp directory if not public
            if (!isPublic) {
              await fs.rm(tempDir, { recursive: true, force: true });
            }

            resolve(NextResponse.json({
              success: true,
              message: 'FHE keys generated successfully',
              keyName: name,
              keys: {
                clientKey: keys.clientKey,
                serverKey: keys.serverKey,
                publicKey: keys.publicKey,
              },
              ...(public && { localPath: tempDir }),
            }));
          } catch (error) {
            console.error('Error reading keys:', error);
            reject(NextResponse.json({
              success: false,
              error: 'Failed to read generated keys',
            }, { status: 500 }));
          }
        } else {
          console.error(`Key generation failed with code ${code}:`, stderr);
          reject(NextResponse.json({
            success: false,
            error: `Key generation failed: ${stderr || stdout}`,
          }, { status: 500 }));
        }
      });

      child.on('error', (error) => {
        console.error('Failed to start key generation:', error);
        reject(NextResponse.json({
          success: false,
          error: `Failed to start key generation: ${error.message}`,
        }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error('FHE key generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during key generation',
    }, { status: 500 });
  }
}