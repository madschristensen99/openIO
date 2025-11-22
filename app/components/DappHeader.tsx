'use client';

import Link from 'next/link';

export default function DappHeader() {
  return (
    <div className="dapp-header">
      <div className="dapp-header-content">
        <div className="dapp-header-left">
          <h1 className="dapp-hero-title">The Privacy Compute Hub</h1>
          <p className="dapp-hero-subtitle">
            Discover, build, and deploy private computation — ZK, FHE, and iO — in one unified platform.
          </p>
          <div className="dapp-hero-actions">
            <Link href="/dapp/models" className="dapp-hero-btn primary">
              Explore Models
            </Link>
            <Link href="/dapp/builder" className="dapp-hero-btn secondary">
              Build Workflows
            </Link>
          </div>
        </div>
        <div className="dapp-header-right">
          <Link href="/dapp/builder" className="dapp-builder-btn">
            Builder
          </Link>
        </div>
      </div>
    </div>
  );
}

