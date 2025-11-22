'use client';

import { useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import { models, Model, ModelCategory, getModelsByCategory } from '../../data/models';

export default function ModelsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useMemo(() => {
    // Exclude operations from all models
    let filtered = models.filter(m => m.category !== 'operation');

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getModelsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(lowerQuery) ||
        model.description.toLowerCase().includes(lowerQuery) ||
        model.author.toLowerCase().includes(lowerQuery) ||
        model.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const nonOperationModels = models.filter(m => m.category !== 'operation');
    return {
      all: nonOperationModels.length,
      zk: getModelsByCategory('zk').length,
      fhe: getModelsByCategory('fhe').length,
      io: getModelsByCategory('io').length,
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="models-page">
        <div className="models-container">
          <div className="models-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Categories</h3>
              <div className="category-list">
                <button
                  className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <div className="category-info">
                    <span className="category-name">All Models</span>
                    <span className="category-count">{categoryCounts.all}</span>
                  </div>
                </button>
                <button
                  className={`category-item ${selectedCategory === 'zk' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('zk')}
                >
                  <div className="category-info">
                    <span className="category-name">ZK Circuits</span>
                    <span className="category-count">{categoryCounts.zk}</span>
                  </div>
                </button>
                <button
                  className={`category-item ${selectedCategory === 'fhe' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('fhe')}
                >
                  <div className="category-info">
                    <span className="category-name">FHE Engines</span>
                    <span className="category-count">{categoryCounts.fhe}</span>
                  </div>
                </button>
                <button
                  className={`category-item ${selectedCategory === 'io' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('io')}
                >
                  <div className="category-info">
                    <span className="category-name">iO Coprocessors</span>
                    <span className="category-count">{categoryCounts.io}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="models-main">
            <div className="models-header">
              <div>
                <h1 className="models-title">Models</h1>
                <p className="models-count">{filteredModels.length.toLocaleString()} models</p>
              </div>
              <div className="models-search">
                <input
                  type="text"
                  placeholder="Filter by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="models-list">
              {filteredModels.map((model) => (
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
                      {model.parameters && (
                        <span className="meta-item">
                          <span className="meta-label">Parameters</span>
                          <span className="meta-value">{model.parameters}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

