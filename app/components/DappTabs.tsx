'use client';

type TabType = 'models' | 'spaces' | 'datasets' | 'zk-circuits' | 'fhe-engines';

interface DappTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function DappTabs({ activeTab, onTabChange }: DappTabsProps) {
  return (
    <div className="dapp-tabs">
      <button 
        className={`dapp-tab ${activeTab === 'models' ? 'active' : ''}`}
        onClick={() => onTabChange('models')}
      >
        Models
      </button>
      <button 
        className={`dapp-tab ${activeTab === 'spaces' ? 'active' : ''}`}
        onClick={() => onTabChange('spaces')}
      >
        Spaces
      </button>
      <button 
        className={`dapp-tab ${activeTab === 'datasets' ? 'active' : ''}`}
        onClick={() => onTabChange('datasets')}
      >
        Datasets
      </button>
      <button 
        className={`dapp-tab ${activeTab === 'zk-circuits' ? 'active' : ''}`}
        onClick={() => onTabChange('zk-circuits')}
      >
        ZK Circuits
      </button>
      <button 
        className={`dapp-tab ${activeTab === 'fhe-engines' ? 'active' : ''}`}
        onClick={() => onTabChange('fhe-engines')}
      >
        FHE Engines
      </button>
    </div>
  );
}

