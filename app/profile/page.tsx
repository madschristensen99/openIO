'use client';

import { useMemo } from 'react';
import Navbar from '../components/Navbar';
import { models, Model } from '../data/models';

// Hardcoded current user (in real app, this would come from auth)
const currentUser = 'openio';

// Hardcoded earnings data for user's models
const modelEarnings: Record<string, { revenue: string; executions: string; lastPayout: string }> = {
  'zk-verifier': { revenue: '$1,234.56', executions: '45.2k', lastPayout: '2 days ago' },
  'zk-arbitrage': { revenue: '$2,891.23', executions: '89.5k', lastPayout: '1 day ago' },
  'fhe-encrypt': { revenue: '$567.89', executions: '12.3k', lastPayout: '5 days ago' },
  'fhe-ckks': { revenue: '$890.12', executions: '23.4k', lastPayout: '4 days ago' },
  'io-seal': { revenue: '$3,456.78', executions: '156.7k', lastPayout: '3 hours ago' },
  'io-execute': { revenue: '$1,567.34', executions: '67.8k', lastPayout: '6 hours ago' },
  'io-contract': { revenue: '$4,123.45', executions: '234.1k', lastPayout: '1 hour ago' },
};

export default function ProfilePage() {
  const userModels = useMemo(() => {
    return models.filter(model => model.author === currentUser && model.category !== 'operation');
  }, []);

  const totalStats = useMemo(() => {
    let totalRevenue = 0;
    let totalExecutions = 0;
    let totalLikes = 0;

    userModels.forEach(model => {
      const earnings = modelEarnings[model.id];
      if (earnings) {
        totalRevenue += parseFloat(earnings.revenue.replace(/[$,]/g, ''));
        totalExecutions += parseFloat(earnings.executions.replace(/[k]/g, '')) * 1000;
      }
      totalLikes += parseFloat(model.likes.replace(/[k]/g, '')) * 1000;
    });

    return {
      revenue: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      executions: totalExecutions >= 1000 ? `${(totalExecutions / 1000).toFixed(1)}k` : totalExecutions.toString(),
      likes: totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(1)}k` : totalLikes.toString(),
    };
  }, [userModels]);

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-main-layout">
            <div className="profile-left">
              <div className="profile-header">
                <div className="profile-avatar">
                  {currentUser[0].toUpperCase()}
                </div>
                <div className="profile-info">
                  <h1 className="profile-name">{currentUser}</h1>
                  <p className="profile-bio">Privacy computation developer</p>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value revenue">{totalStats.revenue}</div>
                  <div className="stat-description">From monetized models</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Executions</div>
                  <div className="stat-value">{totalStats.executions}</div>
                  <div className="stat-description">Model runs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Likes</div>
                  <div className="stat-value">{totalStats.likes}</div>
                  <div className="stat-description">Community engagement</div>
                </div>
              </div>
            </div>

            <div className="profile-right">
              <div className="profile-settings">
                <h3 className="settings-title">Settings</h3>
                <div className="settings-list">
                  <button className="settings-item">
                    <span className="settings-label">Account Settings</span>
                    <span className="settings-arrow">→</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-label">Payment Methods</span>
                    <span className="settings-arrow">→</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-label">Notifications</span>
                    <span className="settings-arrow">→</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-label">API Keys</span>
                    <span className="settings-arrow">→</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-label">Privacy</span>
                    <span className="settings-arrow">→</span>
                  </button>
                  <div className="settings-divider"></div>
                  <button className="settings-item logout">
                    <span className="settings-label">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">My Models</h2>
              <span className="section-count">{userModels.length} models</span>
            </div>

            <div className="models-list">
              {userModels.map((model) => {
                const earnings = modelEarnings[model.id];
                return (
                  <div key={model.id} className="model-item">
                    <div className="model-avatar">
                      {model.author[0].toUpperCase()}
                    </div>
                    <div className="model-content">
                      <div className="model-header">
                        <h3 className="model-name">{model.name}</h3>
                        <span className={`model-badge model-badge-${model.category}`}>
                          {model.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="model-author">by {model.author}</p>
                      <p className="model-description">{model.description}</p>
                      {model.tags && model.tags.length > 0 && (
                        <div className="model-tags">
                          {model.tags.map((tag, idx) => (
                            <span key={idx} className="model-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="model-meta">
                        <span className="meta-item">
                          <span className="meta-label">Downloads</span>
                          <span className="meta-value">{model.downloads}</span>
                        </span>
                        <span className="meta-item">
                          <span className="meta-label">Likes</span>
                          <span className="meta-value">{model.likes}</span>
                        </span>
                        <span className="meta-item">
                          <span className="meta-label">Updated</span>
                          <span className="meta-value">{model.updated}</span>
                        </span>
                        {earnings && (
                          <>
                            <span className="meta-item earnings">
                              <span className="meta-label">Revenue</span>
                              <span className="meta-value revenue-value">{earnings.revenue}</span>
                            </span>
                            <span className="meta-item">
                              <span className="meta-label">Executions</span>
                              <span className="meta-value">{earnings.executions}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

