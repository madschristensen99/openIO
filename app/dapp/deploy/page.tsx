'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { PhalaDeployUI } from '../components/PhalaDeployUI';

export default function DeployPage() {

  const [selectedFile, setSelectedFile] = useState<string | null>('contract.io');
  const [files, setFiles] = useState<Record<string, string>>({
    'contract.io': `// openIO Contract Example
// This contract demonstrates sealed logic


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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Deploy FHE Apps to TEE
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deploy your Rust-based Fully Homomorphic Encryption applications to 
              Trusted Execution Environments like Phala Network with just one click.
            </p>
          </div>

          <PhalaDeployUI />

          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">👨‍💻</div>
                <h4 className="font-semibold mb-1">1. Write FHE Code</h4>
                <p className="text-sm text-gray-600">
                  Use our code editor to write Rust FHE applications with the TFHE library
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <h4 className="font-semibold mb-1">2. Configure TEE</h4>
                <p className="text-sm text-gray-600">
                  Set runtime parameters like memory limits and timeouts for your TEE deployment
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <h4 className="font-semibold mb-1">3. One-Click Deploy</h4>
                <p className="text-sm text-gray-600">
                  Deploy your application to secure hardware enclaves with a single click
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}