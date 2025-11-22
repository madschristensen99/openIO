import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { source, filename }: { source: string; filename: string } = await request.json();
    
    // Create temporary directory for compilation
    const tempDir = join('/tmp', 'openio-compilation', Date.now().toString());
    mkdirSync(tempDir, { recursive: true });
    
    const sourcePath = join(tempDir, filename);
    writeFileSync(sourcePath, source);
    
    const compilationResult = await new Promise<any>((resolve, reject) => {
      const compileProcess = spawn('foundry', ['compile', '--force'], {
        cwd: '/home/remsee/openIO/symbiotic',
        env: {
          ...process.env,
          OPENIO_SOURCE: sourcePath,
          SOLC_VERSION: '0.8.25',
        }
      });
      
      let stderr = '';
      let stdout = '';
      
      compileProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      compileProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      compileProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            message: 'Compilation successful',
            output: stdout,
            bytecode: 'Successfully compiled contract',
            // TODO: Extract bytecode from compiler output
          });
        } else {
          reject(new Error(`Compilation failed: ${stderr || stdout}`));
        }
      });
    });
    
    return NextResponse.json(compilationResult);
    
  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compilation error'
    }, { status: 500 });
  }
}