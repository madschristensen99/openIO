'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import ThreeBackground from './ThreeBackground';
import Navbar from './Navbar';
import CardEffect from './CardEffect';
import DappMainContent from './DappMainContent';

export default function CardScanner() {
  useEffect(() => {
    // Setup scroll reveal animations
    const setupScrollReveal = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
      );

      document.querySelectorAll('.scroll-text').forEach((el) => {
        observer.observe(el);
      });
    };

    // Delay to ensure DOM is ready
    setTimeout(setupScrollReveal, 100);
  }, []);

  return (
    <>
      <Navbar />
      <div className="hero-block">
        <CardEffect />
        <div className="main-hero-section">
          <h1 className="main-hero-title">The Privacy Compute Hub</h1>
          <p className="main-hero-subtitle">
            Discover, build, and deploy private computation — ZK, FHE, and iO — in one unified platform.
          </p>
          <div className="main-hero-actions">
            <Link href="/dapp/models" className="main-hero-btn primary">
              Explore Models
            </Link>
            <Link href="/dapp/builder" className="main-hero-btn secondary">
              Build Workflows
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-spacer"></div>

      <DappMainContent showHeader={false} />

      <div className="content-sections">
        <section className="content-section scroll-reveal">
          <ThreeBackground className="section-three-bg" />
          <h2 className="section-title scroll-text">Discover Privacy Models</h2>
          <p className="section-punch scroll-text">
            A Hugging Face for ZK, FHE, and iO.
            <br />
            <span className="section-accent">
              Browse a global hub of privacy components: zero-knowledge circuits, fully homomorphic functions, iO-sealed modules, and hybrid privacy operators. All forkable, versioned, and ready to drop into your pipeline.
            </span>
          </p>
        </section>

        <section className="content-section scroll-reveal">
          <ThreeBackground className="section-three-bg" />
          <h2 className="section-title scroll-text">Build Private Applications</h2>
          <div className="tech-stack scroll-text">
            <div className="tech-item">
              <span className="tech-label">Code Mode</span>
              <span className="tech-desc">Write normal JavaScript/TypeScript/Python/Rust. Import privacy primitives like libraries. Compile into sealed or encrypted logic.</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Flow Mode</span>
              <span className="tech-desc">A drag-and-drop graph editor for assembling privacy workflows, routing encrypted data, and chaining ZK → FHE → iO steps.</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Remix Ergonomics</span>
              <span className="tech-desc">Full-stack developer experience with familiar tooling and workflows.</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">n8n Composition</span>
              <span className="tech-desc">Visual workflow builder for composing privacy pipelines without writing cryptography.</span>
            </div>
          </div>
          <p className="section-punch scroll-text">
            <span className="section-accent">No math. No circuits. No cryptography. Just building.</span>
          </p>
        </section>

        <section className="content-section scroll-reveal">
          <ThreeBackground className="section-three-bg" />
          <h2 className="section-title scroll-text">Deploy Invisible Compute</h2>
          <p className="section-punch scroll-text">
            One-click deployment across environments.
            <br />
            <span className="section-accent">
              Deploy sealed or encrypted applications to cloud runtime, edge workers, local secure enclaves, chain-based execution, and hybrid ZK + FHE + iO pipelines. Your logic stays private. Your data stays encrypted. Think "Vercel for private computation."
            </span>
          </p>
        </section>

        <section className="content-section highlight-section scroll-reveal">
          <ThreeBackground className="section-three-bg" />
          <p className="section-quote scroll-text">
            Computation without exposure.
            <br />
            Privacy without complexity.
            <br />
            <span className="quote-emphasis">A new era of invisible applications.</span>
          </p>
        </section>
      </div>
    </>
  );
}
