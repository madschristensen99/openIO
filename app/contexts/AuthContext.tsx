'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface AuthUser {
  address: string;
  ens?: string;
  balance?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  provider: null,
  signer: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    // Check if wallet is already connected
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const addresses = await provider.listAccounts();
          const address = addresses[0];
          const balance = await provider.getBalance(address);
          
          // Get ENS name if available
          let ens: string | undefined;
          try {
            ens = await provider.lookupAddress(address);
          } catch {
            // ENS lookup failed, use address
          }

          setUser({
            address: address,
            ens: ens || undefined,
            balance: ethers.formatEther(balance),
          });
          setIsConnected(true);
          setProvider(provider);
          const signer = await provider.getSigner();
          setSigner(signer);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet to continue');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const address = accounts[0];
      const balance = await provider.getBalance(address);
      
      // Get ENS name if available
      let ens: string | undefined;
      try {
        ens = await provider.lookupAddress(address);
      } catch {
        // ENS lookup failed, use address
      }

      setUser({
        address,
        ens: ens || undefined,
        balance: ethers.formatEther(balance),
      });
      setIsConnected(true);
      setProvider(provider);
      const signer = await provider.getSigner();
      setSigner(signer);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setUser(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        provider,
        signer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}