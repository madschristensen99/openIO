'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import ZKDeployer from './ZKDeployer';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';

export default function DeployPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>('circuit.circom');
  const [files, setFiles] = useState<Record<string, string>>({
    'circuit.circom': `// Simple multiplier circuit for testing
include "circomlib.circom";

template Multiplier() {
    signal input a;
    signal input b;
    signal output c;
    
    c <== a * b;
}

component main = Multiplier();
`,
    'input.json': JSON.stringify({
  "a": 5,
  "b": 7
}, null, 2),
    'verify.js': `const { groth16 } = require('snarkjs');
const fs = require('fs');

async function verifyProof() {
    const vKey = JSON.parse(fs.readFileSync("verification_key.json", "utf-8"));
    const publicSignals = JSON.parse(fs.readFileSync("public.json", "utf-8"));
    const proof = JSON.parse(fs.readFileSync("proof.json", "utf-8"));

    const res = await groth16.verify(vKey, publicSignals, proof);
    
    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
}

verifyProof();
`,
    'README.md': `# ZK Circuit Deployment

## Circuit Files
- \\\`circuit.circom\\\` - Your Zero-Knowledge circuit
- \\\`input.json\\\` - Input values for proof generation
- \\\`verify.js\\\` - JavaScript verification script

## Getting Started
1. \\\`npm install\\\`
2. \\\`npm run compile\\\`
3. \\\`npm run prove\\\`
4. \\\`npm run deploy\\\`

## Deployment Options
- Boundless Network
- Ethereum Mainnet
- Optimism
- Arbitrum
- Polygon
`  });
  
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '🔒 Welcome to ZK Circuit Deployment',
    '💡 Load your Circom/Noir circuit and deploy to Boundless',
    '',
  ]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const updateFileContent = (filename: string, content: string) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
  };

  const addTerminalMessage = (message: string) => {
    setTerminalOutput(prev => [...prev, message]);
  };

  return (
    <>
      <Navbar />
      <div className="dapp-container">
        <div className="dapp-layout">
          <FileExplorer 
            files={Object.keys(files)}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
          
          <div className="dapp-main">
            <div className="dapp-toolbar">
              <div className="toolbar-left">
                <h2 className="dapp-title">ZK Circuit IDE</h2>
              </div>
              <div className="toolbar-right">
                <button 
                  className="toolbar-btn compile-btn"
                  onClick={() => {
                    setIsCompiling(true);
                    addTerminalMessage('> Compiling ZK circuit...');
                    setTimeout(() => {
                      addTerminalMessage('✓ Circuit compiled successfully');
                      addTerminalMessage('✓ Constraints generated: 10');
                      addTerminalMessage('✓ Witness ready for deployment');
                      setIsCompiling(false);
                    }, 3000);
                  }}
                  disabled={isCompiling || isDeploying}
                >
                  {isCompiling ? 'Compiling...' : 'Compile Circuit'}
                </button>
                <button 
                  className="toolbar-btn deploy-btn"
                  onClick={() => {
                    setIsDeploying(true);
                    addTerminalMessage('> Deploying to Boundless...');
                    setTimeout(() => {
                      addTerminalMessage('✓ Deployment successful');
                      addTerminalMessage('✓ Contract address: 0x1234...5678');
                      setDeployedAddress('0x1234...5678');
                      setIsDeploying(false);
                    }, 5000);
                  }}
                  disabled={isCompiling || isDeploying}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy to Boundless'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CodeEditor
                  filename={selectedFile || ''}
                  content={selectedFile ? files[selectedFile] : ''}
                  onChange={(content) => selectedFile && updateFileContent(selectedFile, content)}
                />
              </div>
              
              <div className="lg:col-span-1">
                <ZKDeployer />
              </div>
            </div>

            <div className="mt-4">
              <Terminal output={terminalOutput} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dapp-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        
        .dapp-layout {
          display: flex;
          flex: 1;
          margin-top: 60px;
        }
        
        .dapp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          overflow: hidden;
        }
        
        .dapp-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 1rem;
        }
        
        .dapp-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #374151;
        }
        
        .toolbar-right {
          display: flex;
          gap: 0.5rem;
        }
        
        .toolbar-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .compile-btn {
          background: #3b82f6;
          color: white;
        }
        
        .compile-btn:hover {
          background: #2563eb;
        }
        
        .deploy-btn {
          background: #10b981;
          color: white;
        }
        
        .deploy-btn:hover {
          background: #059669;
        }
        
        .toolbar-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}