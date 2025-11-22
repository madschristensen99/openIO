# IO Coprocessor Project

## Overview

This is a multi-component repository containing:

1. **Docusaurus Documentation Site** (`docs/`) - A modern static website for project documentation
2. **Symbiotic Smart Contracts** (`symbiotic/`) - Solidity smart contract project using Foundry
3. **IO Coprocessor Specification** (`spec.md`) - Technical specification for a decentralized indistinguishability obfuscation coprocessor

## Project Goals

The IO Coprocessor enables Solidity smart contracts to leverage Indistinguishability Obfuscation (iO) through a decentralized network of compute nodes, combining:
- Diamond iO (cryptographic primitives)
- Symbiotic (shared security & attestation)
- Fluence (decentralized compute execution)
- Filecoin Onchain Cloud (verifiable storage)

## Current State

### Active Frontend
- **Docusaurus Documentation Website**: Running on port 5000 in development mode
- Status: Development server configured and operational
- Access: Available through the webview preview
- Deployment: Configured for static site deployment via Replit publish button

### Project Components
- **docs/**: Docusaurus website with tutorials, blog, and documentation
- **symbiotic/**: Smart contract examples for task-based networks
- **0g/**, **diamond-io/**: Additional blockchain integration components

## Recent Changes (November 22, 2025)

- Installed Node.js 20 runtime environment
- Configured Docusaurus to run on port 5000 with host 0.0.0.0 for Replit proxy compatibility
- Set up workflow for automatic Docusaurus server startup
- Created .gitignore with Node.js and Foundry-specific rules
- Configured deployment for static site generation
- Installed all npm dependencies for Docusaurus

## Project Architecture

### Frontend (Docusaurus)
- **Location**: `docs/`
- **Technology**: Docusaurus 3.9.2, React 19, TypeScript
- **Port**: 5000
- **Host**: 0.0.0.0 (configured for Replit proxy)
- **Build Output**: `docs/build/`

### Smart Contracts (Symbiotic)
- **Location**: `symbiotic/`
- **Technology**: Solidity, Foundry
- **Purpose**: Task-based network examples using Symbiotic Relay
- **Local Deployments**: Includes network deployment scripts for Docker-based local testing

### Structure
```
.
├── docs/                  # Docusaurus documentation site
│   ├── blog/             # Blog posts
│   ├── docs/             # Documentation content
│   ├── src/              # React components and pages
│   ├── static/           # Static assets
│   └── package.json      # Node.js dependencies
├── symbiotic/            # Solidity smart contracts
│   ├── src/              # Contract source files
│   ├── script/           # Deployment scripts
│   ├── test/             # Contract tests
│   └── foundry.toml      # Foundry configuration
├── spec.md               # Technical specification
└── README.md             # Project readme
```

## User Preferences

- Clean, professional documentation structure
- Modern web technologies (React, TypeScript)
- Blockchain-focused development
- Decentralized architecture patterns

## Development Workflow

### Running the Documentation Site
The Docusaurus site starts automatically via the configured workflow:
```bash
cd docs && npm start
```

### Building for Production
```bash
cd docs && npm run build
```

### Working with Smart Contracts
The symbiotic directory contains Foundry-based smart contracts. See `symbiotic/README.md` for detailed setup instructions including Docker-based local network deployment.

## Deployment

### Current Configuration
- **Type**: Static site deployment
- **Build Command**: `cd docs && npm run build`
- **Public Directory**: `docs/build`
- **Platform**: Replit Deployments

### Publishing
Users can publish the documentation site using the Replit publish button, which will build the static site and deploy it with a live URL.

## Dependencies

### Runtime
- Node.js 20.x
- npm (package manager)

### Key Packages
- @docusaurus/core: 3.9.2
- @docusaurus/preset-classic: 3.9.2
- React: 19.0.0
- TypeScript: 5.6.2

## Notes

- The documentation site is configured to work with Replit's proxy system (host: 0.0.0.0, port: 5000)
- The project includes multiple blockchain components that may require additional setup for full functionality
- Smart contract development requires Foundry toolchain (not currently configured in this Replit environment)
