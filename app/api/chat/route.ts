import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let message: string = '';
  
  try {
    const body = await request.json();
    message = body.message || '';
    
    // Real OpenAI integration (requires OPENAI_API_KEY)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert openIO and sloidit assistant. Provide technical help with smart contract compilation, deployment, and blockchain interactions. Be concise and helpful.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    return NextResponse.json({
      success: true,
      message: reply
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    // Fallback response if OpenAI is not available
    const fallbackResponse = getFallbackResponse(message || 'Hello');
    
    return NextResponse.json({
      success: true,
      message: fallbackResponse,
      fallback: true
    });
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! I\'m your openIO assistant. I can help you compile and deploy smart contracts. The system supports both solidity compilation and real deployment using Foundry/Forge.';
  }
  
  if (lower.includes('compile') || lower.includes('build')) {
    return 'Use the Compile button to run `forge compile` on your contract. This performs real Solidity compilation with foundry. Make sure your contract is properly formatted and includes all necessary SPDX licenses and pragma statements.';
  }
  
  if (lower.includes('deploy') || lower.includes('deployed')) {
    return 'Use the Deploy button to deploy using `forge create` command. This connects to localhost:8545 by default and uses the standard Foundry deployment process. You\'ll get a real transaction hash and contract address.';
  }
  
  if (lower.includes('syntax') || lower.includes('error')) {
    return 'For compilation errors, check your Solidity syntax, ensure correct SPDX license identifier, and use proper contracts/test contracts. Example: Start with \'pragma solidity ^0.8.25;\' and include SPDX-License-Identifier: MIT';
  }
  
  return 'I can help you with smart contract compilation and deployment using real Foundry tooling. Ask me about compiling Solidity, deployment procedures, or troubleshooting compilation issues.';
}