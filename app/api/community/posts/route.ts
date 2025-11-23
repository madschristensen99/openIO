import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

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

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function loadPosts(): Promise<ForumPost[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [
      {
        id: '1',
        title: 'Welcome to the openIO Community!',
        author: 'openio_team',
        authorAvatar: '👤',
        category: 'announcements',
        replies: 0,
        views: 0,
        lastActivity: 'Just now',
        isPinned: true,
        tags: ['welcome', 'community'],
        content: 'Welcome to the official openIO community forum! This is a place for developers to connect, share knowledge, and get help with openIO. Feel free to introduce yourself and share your projects.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'How to get started with openIO?',
        author: 'community_moderator',
        authorAvatar: '👤',
        category: 'help',
        replies: 0,
        views: 0,
        lastActivity: 'Just now',
        tags: ['getting-started', 'tutorial'],
        content: 'Looking to get started with openIO? This post covers the basics of setting up your development environment, creating your first project, and running code with privacy-preserving cryptography.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  }
}

async function savePosts(posts: ForumPost[]) {
  await ensureDataDir();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
}

export async function GET() {
  try {
    const posts = await loadPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const posts = await loadPosts();
    const newPost: ForumPost = {
      id: Date.now().toString(),
      title,
      content,
      category,
      tags: tags || [],
      author: 'anonymous_user', // In a real app, this would come from auth
      authorAvatar: '👤',
      replies: 0,
      views: 0,
      lastActivity: 'Just now',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    await savePosts(posts);

    return NextResponse.json({ post: newPost });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}