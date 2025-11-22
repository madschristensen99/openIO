'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
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
        </div>
      </div>
    </nav>
  );
}

