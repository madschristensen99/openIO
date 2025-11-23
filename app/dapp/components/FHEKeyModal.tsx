'use client';

import { useState } from 'react';

interface FHEKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyGenerated: (keys: any) => void;
  onDeployTo0G: (keys: any) => void;
}

export default function FHEKeyModal({ 
  isOpen, 
  onClose, 
  onKeyGenerated, 
  onDeployTo0G 
}: FHEKeyModalProps) {
  const [keyName, setKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState('');

  const handleGenerateKeys = async () => {
    if (!keyName.trim()) return;
    
    setIsGenerating(true);
    setDeployStatus('');
    
    try {
      const response = await fetch('/api/fhe/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyName: keyName.trim(),
          public: false 
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGeneratedKeys(result);
        onKeyGenerated(result);
      } else {
        console.error('Key generation failed:', result.error);
        setDeployStatus(`Generation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating keys:', error);
      setDeployStatus('Generation failed: Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployTo0G = async () => {
    if (!generatedKeys) return;
    
    setIsDeploying(true);
    setDeployStatus('Deploying to 0G...');
    
    try {
      const response = await fetch('/api/fhe/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keys: generatedKeys.keys,
          keyName: generatedKeys.keyName,
          metadata: {
            description: 'FHE keys generated from Diamond IO Builder',
            tags: ['fhe', 'keys', 'builder'],
            encryptionMethod: 'TFHE',
          }
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeployStatus('✅ FHE keys deployed to 0G successfully!');
        onDeployTo0G(result.deployment);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setDeployStatus(`❌ Deployment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deploying to 0G:', error);
      setDeployStatus('❌ Deployment failed: Network error');
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  const getKeySize = (base64Key: string) => {
    const bytes = Math.ceil(base64Key.length * 0.75);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 FHE Key Generation</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {!generatedKeys && (
            <div className="key-generation-section">
              <label>
                <span>Key Set Name:</span>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="my-fhe-keys"
                  className="input-field"
                />
              </label>
              
              <button
                onClick={handleGenerateKeys}
                disabled={isGenerating || !keyName.trim()}
                className="generate-btn"
              >
                {isGenerating ? '🔑 Generating...' : '🔑 Generate Keys'}
              </button>
              
              <div className="info-text">
                ⚡ This will generate three keys:
                <ul>
                  <li><strong>Client Key</strong> - Used for encryption/decryption (keep secret!)</li>
                  <li><strong>Server Key</strong> - Used for homomorphic operations</li>
                  <li><strong>Public Key</strong> - Can be shared publicly for encryption</li>
                </ul>
              </div>
            </div>
          )}

          {generatedKeys && (
            <div className="key-results-section">
              <h3>✅ Keys Generated Successfully!</h3>
              
              <div className="key-summary">
                <div className="key-item">
                  <span className="key-label">Client Key:</span>
                  <span className="key-size">{getKeySize(generatedKeys.keys.clientKey)}</span>
                </div>
                <div className="key-item">
                  <span className="key-label">Server Key:</span>
                  <span className="key-size">{getKeySize(generatedKeys.keys.serverKey)}</span>
                </div>
                <div className="key-item">
                  <span className="key-label">Public Key:</span>
                  <span className="key-size">{getKeySize(generatedKeys.keys.publicKey)}</span>
                </div>
              </div>
              
              <div className="deployment-options">
                <button
                  onClick={handleDeployTo0G}
                  disabled={isDeploying || isGenerating}
                  className="deploy-btn"
                >
                  {isDeploying ? '⬆️ Deploying...' : '🚀 Deploy to 0G Storage'}
                </button>
                
                <div className="status-message">
                  {deployStatus}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 16px;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: #ccc;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
        }
        
        .modal-close:hover {
          color: #fff;
        }
        
        .input-field {
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          margin-bottom: 16px;
        }
        
        .generate-btn, .deploy-btn {
          width: 100%;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .generate-btn:hover:not(:disabled), .deploy-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .generate-btn:disabled, .deploy-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .info-text {
          margin-top: 20px;
          padding: 16px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
          border-left: 3px solid #667eea;
        }
        
        .key-summary {
          margin: 20px 0;
        }
        
        .key-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .key-label {
          font-weight: bold;
          color: #667eea;
        }
        
        .key-size {
          color: #888;
          font-family: monospace;
        }
        
        .status-message {
          margin-top: 12px;
          padding: 8px;
          border-radius: 6px;
          text-align: center;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}