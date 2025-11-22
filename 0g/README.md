# 0G RAG Agent - Diamond IO Codebase Expert

A Next.js application that implements a Retrieval-Augmented Generation (RAG) agent using 0G Storage to answer technical questions about the Diamond IO codebase.

## Features

- **Upload to 0G Storage**: Decentralized storage of the codebase XML file
- **RAG Indexing**: Automatic chunking and embedding of code with OpenAI
- **Semantic Search**: Find relevant code snippets using vector similarity
- **AI Agent**: GPT-4 powered expert that answers questions using indexed knowledge

## Prerequisites

1. **0G Wallet with Balance**: You need a private key with testnet tokens for gas fees
2. **OpenAI API Key**: For embeddings and chat completions

## Setup

### 1. Install Dependencies

```bash
cd 0g
npm install
```

### 2. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# 0G Storage Configuration
NEXT_PUBLIC_0G_EVM_RPC=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_0G_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
ZG_PRIVATE_KEY=your_private_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## How It Works

### Step 1: Upload to 0G Storage

Click "Upload XML File" to upload `repomix-output.xml` to 0G's decentralized storage network. This returns a Content ID (root hash) that uniquely identifies your file.

### Step 2: Build RAG Index

Click "Build RAG Index" to:
- Download the file from 0G Storage
- Chunk the XML into 1200-character pieces with 200-character overlap
- Generate embeddings using OpenAI's `text-embedding-3-small`
- Store the index locally for fast querying

### Step 3 & 4: Query the Agent

Ask technical questions about the codebase:
- "What does BenchCircuit::new_add_mul do?"
- "Explain the role of switched_modulus in RunBenchConfig"
- "How does BuildCircuit compute final gates?"

The agent will:
1. Convert your question into an embedding
2. Find the 5 most relevant code chunks using cosine similarity
3. Send those chunks to GPT-4 as context
4. Generate an accurate answer based on the indexed code

## Architecture

```
┌─────────────────┐
│   Next.js UI    │
│   (React)       │
└────────┬────────┘
         │
         ├─► /api/upload  ──► 0G Storage SDK ──► Decentralized Storage
         │
         ├─► /api/index   ──► OpenAI Embeddings ──► Vector Index
         │
         └─► /api/query   ──► Semantic Search + GPT-4 ──► Answer
```

## API Routes

- `POST /api/upload` - Upload XML to 0G Storage, returns root hash
- `POST /api/index` - Build RAG index from root hash
- `POST /api/query` - Query the agent with a question
- `GET /api/status` - Check if index is built

## Technologies

- **Next.js 16** - React framework
- **0G Storage SDK** - Decentralized storage
- **OpenAI** - Embeddings and chat completions
- **Ethers.js** - Blockchain interactions
- **Tailwind CSS** - Styling

## Troubleshooting

### Upload Fails
- Ensure `ZG_PRIVATE_KEY` has testnet balance
- Check that RPC endpoints are accessible

### Indexing Fails
- Verify `OPENAI_API_KEY` is valid
- Ensure you have API credits

### Queries Return Generic Answers
- Make sure the index was built successfully
- Try more specific questions referencing exact function names

## Learn More

- [0G Storage Documentation](https://docs.0g.ai/)
- [0G SDK](https://www.npmjs.com/package/@0glabs/0g-ts-sdk)
- [OpenAI API](https://platform.openai.com/docs/)
