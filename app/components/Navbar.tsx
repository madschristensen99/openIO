'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light-mode');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link href="/" className="navbar-logo">
          <Image 
            src="/io_logo2.svg" 
            alt="openIO Logo" 
            width={32} 
            height={22}
            className="logo-image"
            priority
            unoptimized
          />
        </Link>
        <div className="navbar-links">
          <Link href="/dapp/models" className="nav-link">Models</Link>
          <Link href="/dapp/builder" className="nav-link">Builder</Link>
          <Link href="/dapp/deploy" className="nav-link">Deploy</Link>
          <Link href="/community" className="nav-link">Community</Link>
          <Link href="/docs" className="nav-link">Docs</Link>
          <Link href="/profile" className="nav-link">Profile</Link>
          <label className="theme-toggle-switch">
            <input
              type="checkbox"
              checked={!isDarkMode}
              onChange={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            <span className="toggle-icon toggle-icon-dark">🌙</span>
            <span className="toggle-icon toggle-icon-light">☀️</span>
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </nav>
  );
}

