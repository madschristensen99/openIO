import { NextRequest, NextResponse } from 'next/server';
import { deployZKCircuitQuick } from '../../../../zk-lib/boundless/boundless-client';

export async function POST(request: NextRequest) {
  try {
    const {
      circuit,
      type,
      parameters,
      rpc_url = 'https://boundless.market',
      private_key
    } = await request.json();

    if (!private_key) {
      return NextResponse.json({
        success: false,
        error: 'Private key required for Boundless deployment',
      }, { status: 400 });
    }

    const deploymentId = await deployZKCircuitQuick(
      circuit,
      type,
      parameters,
      rpc_url,
      private_key
    );

    return NextResponse.json({
      success: true,
      deploymentId,
      status: 'submitted',
      url: `https://boundless.market/deployments/${deploymentId}`,
    });

  } catch (error) {
    console.error('Boundless deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Boundless deployment failed',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const deploymentId = url.searchParams.get('deployment_id');

  if (!deploymentId) {
    return NextResponse.json({
      success: false,
      error: 'deployment_id parameter required',
    }, { status: 400 });
  }

  try {
    // Mock response for status checking
    const mockStatus = {
      status: 'processed', // pending, processing, deployed, failed
      deploymentId,
      contractAddress: '0x' + 'a'.repeat(40),
      transactionHash: '0x' + 'b'.repeat(64),
      estimatedTime: '2 minutes',
    };

    return NextResponse.json({
      success: true,
      ...mockStatus,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed',
    }, { status: 500 });
  }
}