'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface ForumPost {
  id: string;
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
  content?: string;
  createdAt: string;
  updatedAt: string;
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
  { id: 'general', name: 'General Discussion', description: 'General topics about openIO', postCount: 0, icon: '📢' },
  { id: 'help', name: 'Help & Support', description: 'Get help with openIO', postCount: 0, icon: '❓' },
  { id: 'showcase', name: 'Showcase', description: 'Share your projects', postCount: 0, icon: '🎨' },
  { id: 'technical', name: 'Technical Discussion', description: 'Deep technical discussions', postCount: 0, icon: '⚙️' },
  { id: 'announcements', name: 'Announcements', description: 'Official announcements', postCount: 0, icon: '📣' },
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.posts);
      
      // Update category counts
      categories.forEach(category => {
        if (category.id !== 'all') {
          category.postCount = data.posts.filter((post: ForumPost) => post.category === category.id).length;
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'most-replies':
        return b.replies - a.replies;
      case 'most-views':
        return b.views - a.views;
      case 'trending':
        // Simple trending calculation: replies * 2 + views
        return (b.replies * 2 + b.views) - (a.replies * 2 + a.views);
      default:
        return 0;
    }
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
              <button className="new-post-btn" onClick={() => setShowNewPost(true)}>
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
              </div>
              <div className="sort-options">
                <select 
                  className="sort-select" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="most-replies">Most Replies</option>
                  <option value="most-views">Most Views</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>

            <div className="forum-posts">
              {loading && (
                <div className="loading">Loading posts...</div>
              )}
              {error && (
                <div className="error">
                  <p>Error: {error}</p>
                  <button onClick={fetchPosts}>Retry</button>
                </div>
              )}
              {!loading && !error && sortedPosts.length === 0 && (
                <div className="empty-state">
                  <h3>No posts found</h3>
                  <p>Be the first to create a post in this category!</p>
                </div>
              )}
              {!loading && !error && sortedPosts.map(post => (
                <div
                  key={post.id}
                  className={`forum-post ${post.isPinned ? 'pinned' : ''} ${post.isLocked ? 'locked' : ''}`}
                  onClick={() => window.location.href = `/community/post/${post.id}`}
                >
                  {post.isPinned && <span className="pin-badge">Pinned</span>}
                  {post.isLocked && <span className="lock-badge">Locked</span>}
                  
                  <div className="post-avatar">
                    {post.authorAvatar || '👤'}
                  </div>
                  
                  <div className="post-content">
                    <div className="post-header">
                      <h3 className="post-title">{post.title}</h3>
                      <div className="post-meta">
                        <span className="post-author">by {post.author}</span>
                        <span className="post-time">{formatTimeAgo(post.updatedAt)}</span>
                      </div>
                    </div>
                    
                    {post.content && (
                      <div className="post-excerpt">
                        {post.content.substring(0, 150)}...
                      </div>
                    )}
                    
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
                      <span className="stat-value">{post.replies || 0}</span>
                      <span className="stat-label">replies</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{post.views || 0}</span>
                      <span className="stat-label">views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} onPostCreated={fetchPosts} />}
    </>
  );
}

function NewPostModal({ onClose, onPostCreated }: { onClose: () => void; onPostCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      onPostCreated();
      onClose();
    } catch (error) {
      alert('Failed to create post. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="general">General Discussion</option>
              <option value="help">Help & Support</option>
              <option value="showcase">Showcase</option>
              <option value="technical">Technical Discussion</option>
              <option value="announcements">Announcements</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={8}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={creating}>Cancel</button>
            <button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Post'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
}