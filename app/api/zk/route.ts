import { NextRequest, NextResponse } from 'next/server';
import { ZKLibrary } from '../../../../zk-lib';

const zkLib = new ZKLibrary();

// Initialize ZK library on startup
if (process.env.NODE_ENV !== 'test') {
  try {
    zkLib.init(process.env.RPC_URL || 'http://localhost:8545', process.env.PRIVATE_KEY || '');
  } catch (error) {
    console.warn('ZK library initialization failed, running in mock mode');
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    available: zkLib.getSupportedFrameworks(),
    circuits: zkLib.getCircuitTemplates(),
    cairo: zkLib.getCairoContracts(),
    status: 'ready',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { 
      action, 
      circuit, 
      type, 
      parameters, 
      rpc_url, 
      private_key 
    } = await request.json();

    if (action === 'generate') {
      const result = await zkLib.generateZKCircuit(circuit, type, parameters);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'deploy') {
      if (rpc_url && private_key) {
        await zkLib.init(rpc_url, private_key);
      }
      const result = await zkLib.deployCircuit(circuit, type, parameters);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'verify') {
      const { proof, verification_data } = parameters;
      const result = await zkLib.verifyProof(proof, verification_data);
      return NextResponse.json({ success: true, verified: result });
    }

    if (action === 'estimate') {
      const result = await zkLib.estimateDeploymentCost(circuit, type);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({
      error: 'Invalid action. Use: generate, deploy, verify, or estimate',
    }, { status: 400 });

  } catch (error) {
    console.error('ZK API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}