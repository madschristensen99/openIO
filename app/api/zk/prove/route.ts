import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface ProveRequest {
  compilationId: string;
  inputs: Record<string, any>;
  circuitName: string;
  circuitType: 'circom' | 'noir';
}

interface ProveResponse {
  success: boolean;
  id?: string;
  proof?: {
    proof: any;
    publicSignals: any[];
    verificationKey?: any;
  };
  error?: string;
  status?: string;
}

// Proof generation progress tracking
const ongoingProofs = new Map<string, {
  status: string;
  progress: number;
  result?: ProveResponse;
  startedAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body: ProveRequest = await request.json();
    const { compilationId, inputs, circuitName, circuitType } = body;

    if (!compilationId || !inputs || !circuitName || !circuitType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    const proofId = uuidv4();
    ongoingProofs.set(proofId, {
      status: 'generating',
      progress: 0,
      startedAt: new Date()
    });

    // Start proof generation in background
    setTimeout(async () => {
      try {
        await generateMockProof(proofId, circuitType, inputs);
      } catch (error) {
        ongoingProofs.set(proofId, {
          status: 'error',
          progress: 100,
          startedAt: new Date(),
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }, 100);

    return NextResponse.json({
      success: true,
      id: proofId,
      status: 'generating'
    });

  } catch (error) {
    console.error('ZK proof generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({
      success: false,
      error: 'ID parameter required'
    }, { status: 400 });
  }

  const proofData = ongoingProofs.get(id);
  if (!proofData) {
    return NextResponse.json({
      success: false,
      error: 'Proof not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    id,
    ...proofData.result,
    status: proofData.status,
    progress: proofData.progress,
    startedAt: proofData.startedAt.toISOString()
  });
}

async function generateMockProof(proofId: string, circuitType: string, inputs: Record<string, any>) {
  // Simulate proof generation progress
  for (let progress = 0; progress <= 100; progress += 20) {
    await new Promise(resolve => setTimeout(resolve, 200));
    ongoingProofs.set(proofId, {
      status: 'generating',
      progress,
      startedAt: new Date()
    });
  }

  // Generate mock proof based on circuit type
  let mockProof: any;
  let publicSignals: any[];

  if (circuitType === 'circom') {
    mockProof = {
      pi_a: Array.from({ length: 3 }, () => `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`),
      pi_b: Array.from({ length: 3 }, () => [
        `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`,
        `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`
      ]),
      pi_c: Array.from({ length: 3 }, () => `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`)
    };
    
    // Generate mock public signals from inputs
    publicSignals = Object.values(inputs).map(val => 
      typeof val === 'number' ? val.toString() : val
    );

  } else if (circuitType === 'noir') {
    mockProof = {
      proof: Array.from(crypto.getRandomValues(new Uint8Array(192))).map(b => b.toString(16).padStart(2, '0')).join(''),
      commitments: Array.from({ length: 2 }, () => 
        `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`
      )
    };
    
    publicSignals = Object.values(inputs).map(val => 
      typeof val === 'number' ? val.toString() : val
    );
  }

  // Store successful result
  ongoingProofs.set(proofId, {
    status: 'completed',
    progress: 100,
    startedAt: new Date(),
    result: {
      success: true,
      proof: mockProof,
      publicSignals: publicSignals,
      verificationKey: {
        vk_alpha_1: Array.from({ length: 3 }, () => `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`),
        vk_beta_2: Array.from({ length: 3 }, () => [
          `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`,
          `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`
        ])
      }
    }
  });
}