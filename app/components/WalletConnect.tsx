'use client';

import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function WalletConnect() {
  const { user, isConnected, isConnecting, connectWallet, disconnectWallet } = useAuth();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const truncatedAddress = user?.address 
    ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` 
    : '';

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDisconnectModal(false);
  };

  if (isConnected && user) {
    return (
      <div className="wallet-connected">
        <button 
          className="wallet-button"
          onClick={() => setShowDisconnectModal(true)}
        >
          <div className="wallet-info">
            <span className="wallet-address">
              {user.ens || truncatedAddress}
            </span>
            {user.balance && (
              <span className="wallet-balance">
                {parseFloat(user.balance).toFixed(4)} ETH
              </span>
            )}
          </div>
          <div className="wallet-avatar">
            {user.ens ? user.ens.charAt(0).toUpperCase() : user.address.slice(-2).toUpperCase()}
          </div>
        </button>

        {showDisconnectModal && (
          <div className="disconnect-modal">
            <div className="modal-backdrop" onClick={() => setShowDisconnectModal(false)} />
            <div className="modal-content">
              <h3>Account Details</h3>
              <div className="account-info">
                <p><strong>Address:</strong> {user.address}</p>
                {user.ens && <p><strong>ENS:</strong> {user.ens}</p>}
                <p><strong>Balance:</strong> {parseFloat(user.balance || '0').toFixed(4)} ETH</p>
              </div>
              <div className="modal-actions">
                <button className="disconnect-button" onClick={handleDisconnect}>
                  Disconnect Wallet
                </button>
                <button className="close-button" onClick={() => setShowDisconnectModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button 
      className="wallet-button wallet-button-connect"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        'Connecting...'
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}