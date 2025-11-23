'use client';

import { useState } from 'react';
import DappHeader from './DappHeader';
import DappTabs from './DappTabs';
import DappContent from './DappContent';
import DappFeatures from './DappFeatures';

type TabType = 'models' | 'spaces' | 'datasets' | 'zk-circuits' | 'fhe-engines' | 'flow-diagrams';

// Default data - can be overridden via props
const defaultTrendingModels = [
  { id: 1, name: 'SealedArbitrage-v1', author: 'openio', downloads: '12.4k', updated: '2 hours ago' },
  { id: 2, name: 'PrivateSwap-2.0', author: 'crypto-dev', downloads: '8.7k', updated: '5 hours ago' },
  { id: 3, name: 'iO-Contract-Template', author: 'openio', downloads: '15.2k', updated: '1 day ago' },
  { id: 4, name: 'SealedML-Model', author: 'ai-research', downloads: '6.3k', updated: '3 days ago' },
  { id: 5, name: 'PrivateProtocol-v3', author: 'defi-builder', downloads: '9.1k', updated: '1 week ago' },
];

const defaultFeaturedSpaces = [
  { id: 1, title: 'Sealed Contract Builder', author: 'openio', likes: '1.2k', runs: '5.4k' },
  { id: 2, title: 'iO Compiler Playground', author: 'openio', likes: '856', runs: '3.2k' },
  { id: 3, title: 'Private Logic Tester', author: 'dev-tools', likes: '642', runs: '2.1k' },
];

const defaultDatasets = [
  { id: 1, name: 'iO-Contracts-Dataset', author: 'openio', downloads: '4.2k', updated: '1 day ago' },
  { id: 2, name: 'Sealed-Logic-Examples', author: 'research', downloads: '3.8k', updated: '3 days ago' },
  { id: 3, name: 'Private-Protocols-Data', author: 'defi', downloads: '2.9k', updated: '1 week ago' },
];

const defaultZkCircuits = [
  { id: 1, name: 'Arbitrage-Proof-Circuit', author: 'zk-dev', downloads: '8.5k', updated: '4 hours ago', gates: '12.3k' },
  { id: 2, name: 'Private-Swap-Verifier', author: 'crypto-research', downloads: '6.2k', updated: '1 day ago', gates: '8.7k' },
  { id: 3, name: 'Sealed-Logic-Circuit', author: 'openio', downloads: '9.8k', updated: '2 days ago', gates: '15.4k' },
  { id: 4, name: 'iO-Verification-Circuit', author: 'openio', downloads: '7.1k', updated: '5 days ago', gates: '11.2k' },
  { id: 5, name: 'Private-Order-Matching', author: 'defi-zk', downloads: '5.9k', updated: '1 week ago', gates: '9.6k' },
];

const defaultFheEngines = [
  { id: 1, name: 'TFHE-Engine-v2', author: 'fhe-lab', downloads: '11.3k', updated: '6 hours ago', ops: '1.2M' },
  { id: 2, name: 'CKKS-Encryption-Engine', author: 'crypto-research', downloads: '9.7k', updated: '1 day ago', ops: '890k' },
  { id: 3, name: 'BGV-Compute-Engine', author: 'openio', downloads: '10.5k', updated: '3 days ago', ops: '1.5M' },
  { id: 4, name: 'FHE-Accelerator', author: 'fhe-dev', downloads: '8.9k', updated: '4 days ago', ops: '1.1M' },
  { id: 5, name: 'Homomorphic-Runtime', author: 'openio', downloads: '7.6k', updated: '1 week ago', ops: '950k' },
];

interface DappMainContentProps {
  showHeader?: boolean;
  initialTab?: TabType;
  trendingModels?: typeof defaultTrendingModels;
  featuredSpaces?: typeof defaultFeaturedSpaces;
  datasets?: typeof defaultDatasets;
  zkCircuits?: typeof defaultZkCircuits;
  fheEngines?: typeof defaultFheEngines;
}

export default function DappMainContent({
  showHeader = true,
  initialTab = 'models',
  trendingModels = defaultTrendingModels,
  featuredSpaces = defaultFeaturedSpaces,
  datasets = defaultDatasets,
  zkCircuits = defaultZkCircuits,
  fheEngines = defaultFheEngines,
}: DappMainContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  return (
    <div className="dapp-main-page">
      {showHeader && <DappHeader />}
      
      <div className="dapp-content-wrapper">
        <DappTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <DappContent
          activeTab={activeTab}
          trendingModels={trendingModels}
          featuredSpaces={featuredSpaces}
          datasets={datasets}
          zkCircuits={zkCircuits}
          fheEngines={fheEngines}
        />
      </div>

      <DappFeatures />
    </div>
  );
}

