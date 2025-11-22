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
                  className="toolbar-btn deploy-btn"
                  onClick={handleDeploy}
                  disabled={isCompiling || isDeploying}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy'}
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

