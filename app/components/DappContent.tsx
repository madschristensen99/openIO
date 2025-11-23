'use client';

import Link from 'next/link';

type TabType = 'models' | 'spaces' | 'datasets' | 'zk-circuits' | 'fhe-engines' | 'flow-diagrams';

interface DappContentProps {
  activeTab: TabType;
  trendingModels: Array<{ id: number; name: string; author: string; downloads: string; updated: string }>;
  featuredSpaces: Array<{ id: number; title: string; author: string; likes: string; runs: string }>;
  datasets: Array<{ id: number; name: string; author: string; downloads: string; updated: string }>;
  zkCircuits: Array<{ id: number; name: string; author: string; downloads: string; updated: string; gates: string }>;
  fheEngines: Array<{ id: number; name: string; author: string; downloads: string; updated: string; ops: string }>;
}

export default function DappContent({ 
  activeTab, 
  trendingModels, 
  featuredSpaces, 
  datasets, 
  zkCircuits, 
  fheEngines 
}: DappContentProps) {
  return (
    <div className="dapp-content">
      {activeTab === 'models' && (
        <div className="dapp-section">
          <div className="section-header">
            <h2 className="section-title">Trending this week</h2>
            <Link href="/dapp/models" className="section-link">Browse all models →</Link>
          </div>
          <div className="cards-grid">
            {trendingModels.map((model) => (
              <div key={model.id} className="model-card">
                <div className="card-header">
                  <div className="card-author">
                    <span className="author-avatar">{model.author[0].toUpperCase()}</span>
                    <span className="author-name">{model.author}</span>
                  </div>
                </div>
                <h3 className="card-title">{model.name}</h3>
                <div className="card-stats">
                  <span className="stat-item">📥 {model.downloads}</span>
                  <span className="stat-item">🕒 {model.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'spaces' && (
        <div className="dapp-section">
          <div className="section-header">
            <h2 className="section-title">Featured Spaces</h2>
            <Link href="/dapp/spaces" className="section-link">Browse all spaces →</Link>
          </div>
          <div className="cards-grid">
            {featuredSpaces.map((space) => (
              <div key={space.id} className="space-card">
                <div className="card-header">
                  <div className="card-author">
                    <span className="author-avatar">{space.author[0].toUpperCase()}</span>
                    <span className="author-name">{space.author}</span>
                  </div>
                </div>
                <h3 className="card-title">{space.title}</h3>
                <div className="card-stats">
                  <span className="stat-item">❤️ {space.likes}</span>
                  <span className="stat-item">▶️ {space.runs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'datasets' && (
        <div className="dapp-section">
          <div className="section-header">
            <h2 className="section-title">Popular Datasets</h2>
            <Link href="/dapp/datasets" className="section-link">Browse all datasets →</Link>
          </div>
          <div className="cards-grid">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="dataset-card">
                <div className="card-header">
                  <div className="card-author">
                    <span className="author-avatar">{dataset.author[0].toUpperCase()}</span>
                    <span className="author-name">{dataset.author}</span>
                  </div>
                </div>
                <h3 className="card-title">{dataset.name}</h3>
                <div className="card-stats">
                  <span className="stat-item">📥 {dataset.downloads}</span>
                  <span className="stat-item">🕒 {dataset.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'zk-circuits' && (
        <div className="dapp-section">
          <div className="section-header">
            <h2 className="section-title">Trending ZK Circuits</h2>
            <Link href="/dapp/zk-circuits" className="section-link">Browse all circuits →</Link>
          </div>
          <div className="cards-grid">
            {zkCircuits.map((circuit) => (
              <div key={circuit.id} className="zk-circuit-card">
                <div className="card-header">
                  <div className="card-author">
                    <span className="author-avatar">{circuit.author[0].toUpperCase()}</span>
                    <span className="author-name">{circuit.author}</span>
                  </div>
                </div>
                <h3 className="card-title">{circuit.name}</h3>
                <div className="card-stats">
                  <span className="stat-item">📥 {circuit.downloads}</span>
                  <span className="stat-item">⚡ {circuit.gates} gates</span>
                  <span className="stat-item">🕒 {circuit.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fhe-engines' && (
        <div className="dapp-section">
          <div className="section-header">
            <h2 className="section-title">Featured FHE Engines</h2>
            <Link href="/dapp/fhe-engines" className="section-link">Browse all engines →</Link>
          </div>
          <div className="cards-grid">
            {fheEngines.map((engine) => (
              <div key={engine.id} className="fhe-engine-card">
                <div className="card-header">
                  <div className="card-author">
                    <span className="author-avatar">{engine.author[0].toUpperCase()}</span>
                    <span className="author-name">{engine.author}</span>
                  </div>
                </div>
                <h3 className="card-title">{engine.name}</h3>
                <div className="card-stats">
                  <span className="stat-item">📥 {engine.downloads}</span>
                  <span className="stat-item">⚡ {engine.ops} ops/sec</span>
                  <span className="stat-item">🕒 {engine.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'flow-diagrams' && (
        <div className="dapp-section">
          <div className="section-header">
            <h2 className="section-title">AI-Powered Flow Diagrams</h2>
          </div>
          <div style={{ height: '60vh', padding: '1rem' }}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
              <div className="h-full">
                {/* Dynamically import the flow generator */}
                <script type="text/javascript">
                  {`
                    import('/components/AIFlowGenerator').then(module => {
                      const AIFlowGenerator = module.default;
                      // Create and mount the component
                    });
                  `}
                </script>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

