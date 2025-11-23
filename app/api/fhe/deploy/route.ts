import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToZG as uploadTo0G } from '../../../0g/lib/storage';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { 
      keys, 
      keyName, 
      metadata 
    }: { 
      keys: {
        clientKey: string;
        serverKey: string;
        publicKey: string;
      };
      keyName: string;
      metadata?: {
        description?: string;
        tags?: string[];
        encryptionMethod?: string;
      };
    } = await request.json();

    if (!keys || !keys.clientKey || !keys.serverKey || !keys.publicKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing required keys',
      }, { status: 400 });
    }

    const deploymentId = randomUUID();
    const deploymentPackage = {
      id: deploymentId,
      keyName,
      keys: {
        clientKey: keys.clientKey,
        serverKey: keys.serverKey,
        publicKey: keys.publicKey,
      },
      metadata: {
        ...metadata,
        deploymentDate: new Date().toISOString(),
        keyType: 'FHE',
        algorithm: 'TFHE',
        parameters: 'PARAM_MESSAGE_2_CARRY_2',
        version: '1.0',
      },
      security: {
        clientKeyClassification: 'confidential',
        serverKeyClassification: 'restricted',
        publicKeyClassification: 'public',
      }
    };

    // Prepare files for 0G deployment
    const files = [
      {
        name: `${keyName}-full-package.json`,
        content: JSON.stringify(deploymentPackage, null, 2),
        type: 'application/json',
      },
      {
        name: `${keyName}-client-key.bin`,
        content: keys.clientKey,
        type: 'application/octet-stream',
        classification: 'confidential',
      },
      {
        name: `${keyName}-server-key.bin`,
        content: keys.serverKey,
        type: 'application/octet-stream',
        classification: 'restricted',
      },
      {
        name: `${keyName}-public-key.bin`,
        content: keys.publicKey,
        type: 'application/octet-stream',
        classification: 'public',
      },
    ];

    // Upload to 0G Storage
    console.log(`Deploying ${keyName} to 0G...`);
    
    // Create a manifest file with metadata
    const manifest = {
      deploymentId,
      keyName,
      uploadDate: new Date().toISOString(),
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        classification: file.classification,
        size: Buffer.byteLength(file.content, file.name.includes('.bin') ? 'base64' : 'utf8')
      })),
      totalSize: files.reduce((sum, file) => 
        sum + Buffer.byteLength(file.content, file.name.includes('.bin') ? 'base64' : 'utf8'), 0
      ),
      checksums: {
        // You might want to add actual SHA256 checksums in production
        manifest: null,
        clientKey: null,
        serverKey: null,
        publicKey: null,
      }
    };

    // Upload manifest
    const manifestData = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestRootHash = await uploadTo0G(manifestData);

    // Upload individual files
    const fileHashes = {};
    
    for (const file of files) {
      const data = file.name.includes('.bin') 
        ? new Blob([Buffer.from(file.content, 'base64')]) 
        : new Blob([file.content], { type: file.type });
      
      const fileHash = await uploadTo0G(data);
      fileHashes[file.name] = fileHash;
    }

    // Create final deployment record
    const deploymentRecord = {
      deploymentId,
      keyName,
      manifestRootHash,
      fileHashes,
      zgStorage: {
        rootHash: manifestRootHash,
        filesUploaded: Object.keys(fileHashes),
        uploadSuccess: true,
      },
      timestamp: new Date().toISOString(),
      status: 'deployed',
      access: {
        fullPackage: manifestRootHash,
        individualFiles: fileHashes,
      }
    };

    return NextResponse.json({
      success: true,
      message: 'FHE keys deployed to 0G successfully',
      deployment: deploymentRecord,
      url: `/0g-manifest/${manifestRootHash}`,
    });

  } catch (error) {
    console.error('FHE deployment to 0G error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error',
    }, { status: 500 });
  }
}