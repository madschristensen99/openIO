'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';
import AIChat from '../components/AIChat';

export default function DeployPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>('SealedLogic.sol');
  const [files, setFiles] = useState({
    'SealedLogic.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract SealedLogic {
    mapping(address => uint256) private balances;
    uint256 private totalSupply;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed to, uint256 value);
    
    constructor() {
        totalSupply = 1000000 * 10**18;
        balances[msg.sender] = totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function totalSupply() public view returns (uint256) {
        return totalSupply;
    }
    
    function mint(address to, uint256 amount) public {
        balances[to] += amount;
        totalSupply += amount;
        emit Mint(to, amount);
    }
}`,
    'config.json': `{
  "compiler": "openio-0.1.0",
  "target": "sealed",
  "optimization": true
}`,
    'README.md': `# openIO Dapp

Build sealed, invisible applications with openIO.

## Getting Started

1. Write your contract in the editor
2. Click Compile to seal your logic
3. Deploy to the openIO network`
  });
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [zkCompilation, setZkCompilation] = useState<any>(null);
  const [isCompilingZk, setIsCompilingZk] = useState(false);

  const handleCompile = async () => {
    setIsCompiling(true);
    setTerminalOutput(prev => [...prev, '> Compiling contract...']);
    
    try {
      const source = files[selectedFile || 'contract.io'];
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, filename: selectedFile })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTerminalOutput(prev => [
          ...prev,
          '✓ Compilation successful',
          '✓ Compiled bytecode ready',
          '✓ Contract ready for deployment'
        ]);
      } else {
        setTerminalOutput(prev => [
          ...prev,
          `✗ Compilation failed: ${result.error}`
        ]);
      }
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Compilation error: ${error}`
      ]);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCompileZKCircuit = async () => {
    setIsCompilingZk(true);
    setTerminalOutput(prev => [...prev, '> Compiling ZK circuit...']);

    try {
      // Determine circuit type from filename
      const isZKCircuit = selectedFile?.endsWith('.circom') || selectedFile?.endsWith('.cairo');
      
      if (!isZKCircuit) {
        setTerminalOutput(prev => [
          ...prev,
          '⚠ This is not a ZK circuit file (.circom/.cairo required)'
        ]);
        return;
      }

      const type = selectedFile?.endsWith('.circom') ? 'circom' : 'cairo';
      const circuit = selectedFile?.replace('.circom', '').replace('.cairo', '');
      const source = files[selectedFile || ''];

      const response = await fetch('/api/zk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          circuit,
          type,
          parameters: {}
        })
      });

      const result = await response.json();

      if (result.success) {
        setZkCompilation(result.result);
        setTerminalOutput(prev => [
          ...prev,
          `✓ ZK ${type} circuit compiled successfully`,
          `✓ Circuit: ${circuit}`,
          `✓ Type: ${type}`,
          `✓ Ready for Boundless deployment`
        ]);
      } else {
        setTerminalOutput(prev => [
          ...prev,
          `✗ ZK compilation failed: ${result.error}`
        ]);
      }
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ ZK compilation error: ${error}`
      ]);
    } finally {
      setIsCompilingZk(false);
    }
  };

  const handleDeployBoundless = async () => {
    setIsDeploying(true);
    setTerminalOutput(prev => [...prev, '> Deploying to Boundless...']);
    
    try {
      const type = selectedFile?.endsWith('.circom') ? 'circom' : 'cairo';
      const circuit = selectedFile?.replace('.circom', '').replace('.cairo', '');
      
      const response = await fetch('/api/zk/boundless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circuit,
          type,
          parameters: {},
          private_key: process.env.NEXT_PUBLIC_PRIVATE_KEY || '0x1234abcd',
          rpc_url: 'https://boundless.market'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setDeployedAddress(result.deploymentId);
        setTerminalOutput(prev => [
          ...prev,
          `✅ Boundless Deployment Successful!`,
          `🔗 Deployment ID: ${result.deploymentId}`,
          `📊 View at: https://boundless.market/deployments/${result.deploymentId}`,
          `⏱️ Processing typically takes 2-5 minutes`
        ]);
      } else {
        setTerminalOutput(prev => [
          ...prev,
          `✗ Boundless deployment failed: ${result.error}`
        ]);
      }
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Boundless deployment error: ${error}`
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setTerminalOutput(prev => [...prev, '> Deploying contract...']);
    
    try {
      const source = files[selectedFile || 'contract.io'];
      const contractName = selectedFile?.replace('.sol', '') || 'Contract';
      
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName,
          sourceCode: source,
          constructorArgs: []
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeployedAddress(result.address);
        setTerminalOutput(prev => [
          ...prev,
          `✓ Contract deployed successfully`,
          `✓ Address: ${result.address}`,
          `✓ Transaction: ${result.txHash}`,
          `✓ Block: ${result.blockNumber}`
        ]);
      } else {
        setTerminalOutput(prev => [
          ...prev,
          `✗ Deployment failed: ${result.error}`
        ]);
      }
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Deployment error: ${error}`
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  const updateFileContent = (filename: string, content: string) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
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
                <h2 className="dapp-title">openIO IDE</h2>
              </div>
              <div className="toolbar-right">
                <button 
                  className="toolbar-btn compile-btn"
                  onClick={handleCompile}
                  disabled={isCompiling || isDeploying}
                >
                  {isCompiling ? 'Compiling...' : 'Compile'}
                </button>
                <button 
                  className="toolbar-btn compile-btn"
                  onClick={handleCompileZKCircuit}
                  disabled={isCompilingZk || isDeploying}
                >
                  {isCompilingZk ? 'Building ZK...' : 'Build ZK'}
                </button>
                <button 
                  className="toolbar-btn deploy-btn"
                  onClick={handleDeploy}
                  disabled={isCompiling || isDeploying}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy'}
                </button>
                <button 
                  className="toolbar-btn deploy-btn"
                  onClick={handleDeployBoundless}
                  disabled={isCompiling || isDeploying}
                >
                  Deploy to Boundless
                </button>
              </div>
            </div>

            <CodeEditor
              filename={selectedFile || ''}
              content={selectedFile ? files[selectedFile] : ''}
              onChange={(content) => selectedFile && updateFileContent(selectedFile, content)}
            />

            <Terminal output={terminalOutput} />
          </div>
          
          <AIChat />
        </div>
      </div>
    </>
  );
}

