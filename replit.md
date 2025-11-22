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
- **0G RAG Agent**: Running on port 5000 - AI-powered codebase chat interface
- Status: Development server running and operational
- Access: Available through the webview preview
- Purpose: Query the Diamond IO codebase using natural language

### Project Components
- **0g/**: Next.js RAG agent for querying the Diamond IO codebase
- **docs/**: Docusaurus website with tutorials, blog, and documentation
- **symbiotic/**: Smart contract examples for task-based networks
- **diamond-io/**: Additional blockchain integration components

## Recent Changes (November 22, 2025)

### 0G RAG Agent Setup
- Created Next.js 16 application with TypeScript and Tailwind CSS
- Implemented automatic RAG indexing on first load
- Built chat interface for querying the Diamond IO codebase
- Integrated OpenAI for embeddings (text-embedding-3-small) and chat (GPT-4)
- Configured semantic search with cosine similarity
- Set up workflow for automatic server startup on port 5000
- Added error handling and status displays for user feedback

## Project Architecture

### 0G RAG Agent (Active)
- **Location**: `0g/`
- **Technology**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Port**: 5000
- **Host**: 0.0.0.0 (configured for Replit proxy)
- **Purpose**: AI-powered codebase query interface using RAG
- **Features**: Automatic indexing, semantic search, GPT-4 answers

### Docusaurus Documentation
- **Location**: `docs/`
- **Technology**: Docusaurus 3.9.2, React 19, TypeScript
- **Build Output**: `docs/build/`
- **Status**: Available for deployment

### Smart Contracts (Symbiotic)
- **Location**: `symbiotic/`
- **Technology**: Solidity, Foundry
- **Purpose**: Task-based network examples using Symbiotic Relay
- **Local Deployments**: Includes network deployment scripts for Docker-based local testing

### Structure
```
.
├── 0g/                    # 0G RAG Agent (Active)
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes (index-local, query, status)
│   │   ├── page.tsx      # Chat interface
│   │   └── layout.tsx    # Root layout
│   ├── lib/              # Core logic
│   │   ├── rag.ts        # RAG pipeline (chunking, embeddings, search)
│   │   └── storage.ts    # 0G Storage integration (optional)
│   ├── repomix-output.xml # Diamond IO codebase snapshot
│   └── package.json      # Dependencies
├── docs/                  # Docusaurus documentation site
│   ├── blog/             # Blog posts
│   ├── docs/             # Documentation content
│   ├── src/              # React components and pages
│   └── package.json      # Node.js dependencies
├── symbiotic/            # Solidity smart contracts
│   ├── src/              # Contract source files
│   ├── script/           # Deployment scripts
│   └── test/             # Contract tests
└── spec.md               # Technical specification
```

## User Preferences

- Clean, professional documentation structure
- Modern web technologies (React, TypeScript)
- Blockchain-focused development
- Decentralized architecture patterns

## Development Workflow

### Using the 0G RAG Agent (Current)
The RAG agent runs automatically on port 5000. To use it:
1. Add your `OPENAI_API_KEY` in the Secrets tab
2. Open the webview - the agent will automatically index the codebase
3. Start asking questions about the Diamond IO codebase in the chat interface

### Running the Documentation Site
```bash
cd docs && npm start
```

### Building Documentation for Production
```bash
cd docs && npm run build
```

### Working with Smart Contracts
The symbiotic directory contains Foundry-based smart contracts. See `symbiotic/README.md` for detailed setup instructions.

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
