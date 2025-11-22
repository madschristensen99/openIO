'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';
import AIChat from '../components/AIChat';

export default function DeployPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>('contract.io');
  const [files, setFiles] = useState({
    'contract.io': `// openIO Contract Example
// This contract demonstrates sealed logic

contract SealedArbitrage {
    // Private strategy logic
    function executeStrategy(uint256 amount) public returns (uint256) {
        // Logic is sealed - cannot be inspected
        return calculateProfit(amount);
    }
    
    function calculateProfit(uint256 amount) private returns (uint256) {
        // This function is obfuscated
        return amount * 2;
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

  const handleCompile = () => {
    setIsCompiling(true);
    setTerminalOutput(prev => [...prev, '> Compiling contract...']);
    
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '✓ Compilation successful',
        '✓ Logic sealed with iO',
        '✓ Contract ready for deployment'
      ]);
      setIsCompiling(false);
    }, 2000);
  };

  const handleDeploy = () => {
    setTerminalOutput(prev => [...prev, '> Deploying sealed contract...']);
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '✓ Contract deployed to openIO network',
        '✓ Address: 0x...sealed...',
        '✓ Logic is now invisible and protected'
      ]);
    }, 1500);
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
                  disabled={isCompiling}
                >
                  {isCompiling ? 'Compiling...' : 'Compile'}
                </button>
                <button 
                  className="toolbar-btn deploy-btn"
                  onClick={handleDeploy}
                >
                  Deploy
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

