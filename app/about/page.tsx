import Navbar from '../components/Navbar';
import ScrollReveal from '../components/ScrollReveal';

export default function AboutPage() {

  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main className="content-sections about-page">
        <section className="content-section about-hero">
          <h1 className="section-title scroll-text">The Privacy Compute Hub</h1>
          <p className="section-punch scroll-text">
            One Platform. All Privacy Models. Buildable. Deployable. Composable.
            <br />
            <span className="section-accent">
              A Hugging Face for privacy technologies, with the developer experience of Remix and the workflow composition of n8n.
            </span>
          </p>
          <p className="about-kicker scroll-text">
            We're building the first platform that brings together ZK circuits, FHE models, and iO-sealed logic into a single ecosystem — making cryptographic privacy as accessible and composable as modern AI tooling.
          </p>

          <div className="about-grid scroll-text">
            <div className="about-card">
              <h3 className="about-card-title">Privacy Model Hub</h3>
              <p className="about-card-body">
                A global registry of reusable privacy components — ZK circuits, FHE models, iO modules, and hybrid operators. Browse, fork, remix, and deploy instantly.
              </p>
              <ul className="about-list">
                <li>Hugging Face-style model discovery</li>
                <li>Versioned, documented components</li>
                <li>Public and private repositories</li>
              </ul>
            </div>

            <div className="about-card">
              <h3 className="about-card-title">Full-Stack Builder</h3>
              <p className="about-card-body">
                Dual-mode development environment: code with familiar languages, or compose visually with drag-and-drop workflows. Remix ergonomics meets n8n composition.
              </p>
              <ul className="about-list">
                <li>Code mode: JS/TS/Rust/Python</li>
                <li>Flow mode: visual graph editor</li>
                <li>Auto-compile to sealed/encrypted logic</li>
              </ul>
            </div>

            <div className="about-card">
              <h3 className="about-card-title">Runtime & Deployment</h3>
              <p className="about-card-body">
                One-click deployment across cloud, edge, local, enclave, and chain environments. Vercel for private computation — your logic stays private, your data stays encrypted.
              </p>
              <ul className="about-list">
                <li>Multi-environment deployment</li>
                <li>Hybrid ZK + FHE + iO pipelines</li>
                <li>Sealed logic execution</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-section about-vision">
          <h2 className="section-title scroll-text">Our Vision</h2>
          <p className="about-kicker scroll-text">
            A world where developers build with privacy like they build with functions — where cryptography becomes invisible, and every application can be private by default.
          </p>
          
          <div className="vision-grid scroll-text">
            <div className="vision-item">
              <h3 className="vision-item-title">Unified Privacy Stack</h3>
              <p className="vision-item-body">
                We bring together ZK, FHE, and iO into one coherent platform — eliminating fragmentation and making privacy primitives composable.
              </p>
            </div>

            <div className="vision-item">
              <h3 className="vision-item-title">Developer Experience</h3>
              <p className="vision-item-body">
                We abstract away cryptography complexity, enabling developers to build private applications without learning math or circuits.
              </p>
            </div>

            <div className="vision-item">
              <h3 className="vision-item-title">Global Model Library</h3>
              <p className="vision-item-body">
                We create the standard library of private computation — where models, circuits, and sealed programs are as accessible as ML models today.
              </p>
            </div>

            <div className="vision-item">
              <h3 className="vision-item-title">Privacy by Default</h3>
              <p className="vision-item-body">
                We enable a future where sensitive logic can execute safely anywhere, and organizations protect algorithms, not just data.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section about-manifest">
          <h2 className="section-title scroll-text">The Privacy Compute Hub Manifesto</h2>
          <p className="about-kicker scroll-text">
            A statement of intent for how private computation should emerge: unified, accessible, and broadly usable.
          </p>
          
          <div className="manifest-panel scroll-text">
            <div className="manifest-section">
              <h3 className="manifest-section-title">Our mission</h3>
              <p className="manifest-paragraph">
                We are building the Privacy Compute Hub — a unified platform for discovering, building, and deploying ZK, FHE, and iO-based applications. Our goal is to make cryptographic privacy as accessible and composable as modern AI tooling, creating the global platform where privacy models live, sealed logic flows, and full applications can be built without touching math or cryptography.
              </p>
              <p className="manifest-paragraph">
                Today's privacy technologies are powerful but fragmented. ZK proves correctness. FHE encrypts data. iO seals the logic. Until now, developers had to treat each primitive as a separate discipline. We unify all three into one ecosystem — with a developer experience inspired by Hugging Face, Remix, and n8n.
              </p>
              <p className="manifest-paragraph">
                We believe privacy is becoming the new standard for computation. A world where developers build with privacy like they build with functions, where cryptography becomes invisible, and where sensitive logic can execute safely anywhere. We want to be the standard library of private computation and the default place developers go when building privacy-first software.
              </p>
              <p className="manifest-paragraph">
                The future of privacy isn't a single primitive — it's the unification of ZK, FHE, and iO into a single developer experience. Our platform is that unification.
              </p>
            </div>

            <div className="manifest-section">
              <h3 className="manifest-section-title">Background</h3>
              <p className="manifest-paragraph">
                Modern privacy technologies are powerful but fragmented. Zero-knowledge proofs verify correctness without exposing inputs. Fully homomorphic encryption computes on encrypted data without decrypting it. Indistinguishability obfuscation seals logic entirely, making programs that can be run but never understood. Each primitive solves a different piece of the privacy puzzle, but until now, they've existed in isolation.
              </p>
              <p className="manifest-paragraph">
                Developers building privacy-first applications face a fragmented landscape: specialized tools for ZK, separate frameworks for FHE, and emerging research for iO. Each requires deep cryptographic expertise, custom integrations, and manual assembly. The gap between research and practical application remains immense.
              </p>
              <p className="manifest-paragraph">
                Just as Hugging Face unified machine learning model discovery, Remix simplified full-stack development, and n8n made workflow composition visual, we're creating a unified platform for privacy computation. We're building the bridge between the research frontier and builders — making ZK, FHE, and iO as accessible as modern AI tooling.
              </p>
              <p className="manifest-paragraph">
                The future of privacy isn't choosing one primitive over another — it's composing them together. ZK for proofs, FHE for encrypted data, iO for sealed logic. Our platform enables developers to discover, build, and deploy hybrid privacy architectures without touching cryptography.
              </p>
              <p className="manifest-paragraph">
                This represents a fundamental shift: from privacy as an add-on to privacy as the default state of computation. From fragmented tools to unified platforms. From cryptographic expertise required to simple composition.
              </p>
            </div>

            <div className="manifest-section">
              <h3 className="manifest-section-title">Looking forward</h3>
              <p className="manifest-paragraph">
                Today, privacy is fragmented, difficult, and dependent on specialists. But the world is shifting toward private AI, sealed smart contracts, secure multi-party systems, proprietary algorithm protection, encrypted data pipelines, and user-sovereign computation. We provide the platform that makes this shift inevitable.
              </p>
              <p className="manifest-paragraph">
                Our platform enables a world where privacy becomes modular, computation becomes unobservable, and developers deploy sealed or encrypted apps with the same ease as traditional applications. Where privacy primitives combine smoothly, AI and logic become shareable without exposure, and organizations protect algorithms, not just data.
              </p>
              <p className="manifest-paragraph">
                We're building the Privacy Compute Hub as an open, extensible platform that others can build upon. Just as early platforms accelerated machine learning, blockchain, and zero-knowledge systems, we plan to accelerate the arrival of unified privacy-powered applications.
              </p>
              <p className="manifest-paragraph">
                The era of invisible, composable, private-by-default computation is just beginning. We're building the foundation that makes it possible.
              </p>
            </div>

            <div className="manifest-section">
              <h3 className="manifest-section-title">Our approach</h3>
              <p className="manifest-paragraph">
                We're building the Privacy Compute Hub in three layers: The Privacy Model Hub — a Hugging Face-style registry where developers browse, publish, fork, and deploy ZK circuits, FHE models, and iO modules. The Builder Layer — a full-stack development environment with code mode (familiar languages) and flow mode (visual graph editor), combining Remix ergonomics with n8n composition. The Runtime & Deployment Layer — one-click deployment across cloud, edge, local, enclave, and chain environments, with APIs, sandboxes, and encrypted pipelines.
              </p>
              <p className="manifest-paragraph">
                Our platform abstracts away cryptographic complexity while maintaining security. Developers compose privacy workflows, chain ZK → FHE → iO steps, and deploy sealed applications — all without learning math or circuits. The runtime handles circuit proving, encrypted evaluation, sealed artifact execution, and hybrid pipeline orchestration.
              </p>
              <p className="manifest-paragraph">
                Our goal is not to own the applications built on our platform, but to enable everyone to build them. We're creating the standard library of private computation and the default place developers go when building privacy-first software.
              </p>
            </div>

            <div className="manifest-section">
              <h3 className="manifest-section-title">The Platform</h3>
              <p className="manifest-paragraph">
                The Privacy Compute Hub is designed as an open, extensible platform that others can build upon. Our work is open where possible, collaborative by default, and constructed to support the entire ecosystem. We're committed to making privacy computation accessible, not proprietary.
              </p>
              <p className="manifest-paragraph">
                We're fostering a community of researchers, developers, and cryptographers who believe that unified privacy computation can become a universal good — and who want to help define the standards, practices, and tools that make it real. A community where ZK, FHE, and iO come together into one coherent developer experience.
              </p>
              <p className="manifest-paragraph">
                The path ahead requires bridging research and practice, abstracting complexity while maintaining security, and building infrastructure that scales. But we believe deeply that the outcome is worth the effort — a world where privacy is the default state of computation, not an add-on.
              </p>
              <p className="manifest-paragraph">
                If this resonates with you, we invite you to help shape the future of private computation. The era of unified privacy platforms is just beginning.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
