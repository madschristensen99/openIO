'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';

interface ForumPost {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned?: boolean;
  isLocked?: boolean;
  tags?: string[];
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  postCount: number;
  icon: string;
}

const categories: ForumCategory[] = [
  { id: 'all', name: 'All Discussions', description: 'Browse all forum posts', postCount: 0, icon: '💬' },
  { id: 'general', name: 'General Discussion', description: 'General topics about openIO', postCount: 24, icon: '📢' },
  { id: 'help', name: 'Help & Support', description: 'Get help with openIO', postCount: 18, icon: '❓' },
  { id: 'showcase', name: 'Showcase', description: 'Share your projects', postCount: 12, icon: '🎨' },
  { id: 'technical', name: 'Technical Discussion', description: 'Deep technical discussions', postCount: 31, icon: '⚙️' },
  { id: 'announcements', name: 'Announcements', description: 'Official announcements', postCount: 8, icon: '📣' },
];

const forumPosts: ForumPost[] = [
  {
    id: 1,
    title: 'How to build a private arbitrage bot with iO?',
    author: 'crypto_dev',
    authorAvatar: '👤',
    category: 'technical',
    replies: 24,
    views: 342,
    lastActivity: '2 hours ago',
    isPinned: true,
    tags: ['iO', 'arbitrage', 'tutorial'],
  },
  {
    id: 2,
    title: 'Welcome to openIO Community! 🎉',
    author: 'openio_team',
    authorAvatar: '👤',
    category: 'announcements',
    replies: 45,
    views: 892,
    lastActivity: '1 day ago',
    isPinned: true,
    tags: ['announcement'],
  },
  {
    id: 3,
    title: 'Best practices for ZK circuit optimization',
    author: 'zk_master',
    authorAvatar: '👤',
    category: 'technical',
    replies: 18,
    views: 256,
    lastActivity: '3 hours ago',
    tags: ['ZK', 'optimization'],
  },
  {
    id: 4,
    title: 'My first sealed contract deployment - success story!',
    author: 'newbie_dev',
    authorAvatar: '👤',
    category: 'showcase',
    replies: 12,
    views: 189,
    lastActivity: '5 hours ago',
    tags: ['showcase', 'deployment'],
  },
  {
    id: 5,
    title: 'FHE vs ZK: When to use which?',
    author: 'privacy_expert',
    authorAvatar: '👤',
    category: 'general',
    replies: 31,
    views: 567,
    lastActivity: '1 hour ago',
    tags: ['FHE', 'ZK', 'comparison'],
  },
  {
    id: 6,
    title: 'Getting "compilation error" when deploying - help needed',
    author: 'stuck_dev',
    authorAvatar: '👤',
    category: 'help',
    replies: 8,
    views: 134,
    lastActivity: '30 minutes ago',
    tags: ['help', 'deployment'],
  },
  {
    id: 7,
    title: 'Building a private ML inference pipeline',
    author: 'ml_researcher',
    authorAvatar: '👤',
    category: 'showcase',
    replies: 15,
    views: 278,
    lastActivity: '4 hours ago',
    tags: ['ML', 'FHE', 'showcase'],
  },
  {
    id: 8,
    title: 'New feature: React Flow Builder is live!',
    author: 'openio_team',
    authorAvatar: '👤',
    category: 'announcements',
    replies: 22,
    views: 445,
    lastActivity: '6 hours ago',
    isPinned: true,
    tags: ['announcement', 'feature'],
  },
  {
    id: 9,
    title: 'Performance benchmarks: iO vs traditional obfuscation',
    author: 'benchmark_king',
    authorAvatar: '👤',
    category: 'technical',
    replies: 19,
    views: 312,
    lastActivity: '2 hours ago',
    tags: ['performance', 'iO'],
  },
  {
    id: 10,
    title: 'Community guidelines and code of conduct',
    author: 'openio_team',
    authorAvatar: '👤',
    category: 'announcements',
    replies: 5,
    views: 156,
    lastActivity: '1 week ago',
    isPinned: true,
    isLocked: true,
    tags: ['guidelines'],
  },
  {
    id: 11,
    title: 'How to contribute to openIO open source?',
    author: 'contributor',
    authorAvatar: '👤',
    category: 'help',
    replies: 14,
    views: 203,
    lastActivity: '8 hours ago',
    tags: ['contribution', 'open-source'],
  },
  {
    id: 12,
    title: 'Private DeFi protocol using sealed logic',
    author: 'defi_builder',
    authorAvatar: '👤',
    category: 'showcase',
    replies: 27,
    views: 489,
    lastActivity: '1 hour ago',
    tags: ['DeFi', 'showcase', 'iO'],
  },
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = forumPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <>
      <Navbar />
      <div className="community-page">
        <div className="community-header">
          <h1 className="community-title">Community Forum</h1>
          <p className="community-subtitle">
            Connect with developers, share knowledge, and get help with openIO
          </p>
        </div>

        <div className="community-container">
          <div className="forum-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Categories</h3>
              <div className="category-list">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      {category.postCount > 0 && (
                        <span className="category-count">{category.postCount}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <button className="new-post-btn">
                <span>+</span> New Post
              </button>
            </div>
          </div>

          <div className="forum-main">
            <div className="forum-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <div className="sort-options">
                <select className="sort-select">
                  <option>Latest</option>
                  <option>Most Replies</option>
                  <option>Most Views</option>
                  <option>Trending</option>
                </select>
              </div>
            </div>

            <div className="forum-posts">
              {sortedPosts.map(post => (
                <div
                  key={post.id}
                  className={`forum-post ${post.isPinned ? 'pinned' : ''} ${post.isLocked ? 'locked' : ''}`}
                >
                  {post.isPinned && <span className="pin-badge">📌 Pinned</span>}
                  {post.isLocked && <span className="lock-badge">🔒 Locked</span>}
                  
                  <div className="post-avatar">
                    {post.authorAvatar}
                  </div>
                  
                  <div className="post-content">
                    <div className="post-header">
                      <h3 className="post-title">{post.title}</h3>
                      <div className="post-meta">
                        <span className="post-author">by {post.author}</span>
                        <span className="post-time">{post.lastActivity}</span>
                      </div>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="post-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="post-stats">
                    <div className="stat-item">
                      <span className="stat-value">{post.replies}</span>
                      <span className="stat-label">replies</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{post.views}</span>
                      <span className="stat-label">views</span>
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

