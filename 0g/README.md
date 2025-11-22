# 0G RAG Agent - Diamond IO Codebase Expert

A Next.js application that implements a Retrieval-Augmented Generation (RAG) agent to answer technical questions about the Diamond IO codebase using AI-powered semantic search and decentralized storage.

## Features

- **Automatic Indexing**: Automatically indexes the local `repomix-output.xml` file on first load
- **RAG Pipeline**: Chunking, embedding, and semantic search powered by OpenAI
- **Chat Interface**: Clean, intuitive chat interface for querying the codebase
- **AI Agent**: GPT-4 powered expert that provides accurate answers with context from the indexed code
- **0G Storage Integration**: Automatically uploads embeddings to 0G decentralized storage for team sharing
- **Instant Load**: Team members can load pre-computed embeddings from 0G Storage using a shared hash

## Prerequisites

- **OpenAI API Key**: Required for embeddings (text-embedding-3-small) and chat completions (GPT-4)
- **ZG_PRIVATE_KEY**: (Optional) 0G testnet wallet with gas for uploading embeddings to decentralized storage

## Setup

### 1. Install Dependencies

```bash
cd 0g
npm install
```

### 2. Add Your OpenAI API Key

In Replit, go to the "Secrets" tab (🔒 icon in the left sidebar) and add:

- **Key**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key (starts with `sk-...`)

### 3. (Optional) Add 0G Private Key for Storage

To enable automatic uploads to 0G Storage, add:

- **Key**: `ZG_PRIVATE_KEY`
- **Value**: Your 0G testnet private key (ensure wallet has testnet gas)

Without this key, the app will still work perfectly but embeddings will only be stored locally.

### 4. Run the Application

The application is already running! It will automatically:
1. Check if the codebase is already indexed
2. If not, automatically index the `repomix-output.xml` file
3. Upload embeddings to 0G Storage (if ZG_PRIVATE_KEY is provided)
4. Display a shareable root hash for teammates
5. Open the chat interface when ready

## How It Works

### 0G Storage Integration

The app uses 0G decentralized storage to share pre-computed embeddings across your team:

**First User (Indexing)**:
1. App checks for the `EMBEDDINGS_0G_ROOT_HASH` environment variable
2. If not found, indexes the local `repomix-output.xml` file
3. Computes embeddings using OpenAI's `text-embedding-3-small` model
4. Uploads the embeddings JSON to 0G Storage (if `ZG_PRIVATE_KEY` is set)
5. Displays the root hash in the UI

**Team Members (Instant Load)**:
1. Set `EMBEDDINGS_0G_ROOT_HASH` environment variable to the shared hash
2. App automatically downloads pre-computed embeddings from 0G Storage
3. **No OpenAI API calls needed** - instant load from decentralized storage!
4. Start chatting immediately

### Automatic Initialization

When you first load the page, the application:
1. Checks if `EMBEDDINGS_0G_ROOT_HASH` is set - if yes, downloads from 0G Storage
2. If not, loads the local `repomix-output.xml` file containing the Diamond IO codebase
3. Chunks the XML into 1200-character pieces with 200-character overlap
4. Generates vector embeddings using OpenAI's `text-embedding-3-small` model
5. Uploads to 0G Storage if `ZG_PRIVATE_KEY` is available
6. Displays "Ready • X chunks indexed" when complete

### Querying the Agent

Simply type your question in the chat interface! Examples:
- "What does BenchCircuit::new_add_mul do?"
- "Explain the role of switched_modulus in RunBenchConfig"
- "How does BuildCircuit compute final gates?"
- "What cryptographic primitives are used in the diamond-io system?"

The agent will:
1. Convert your question into a vector embedding
2. Find the 5 most relevant code chunks using cosine similarity
3. Send those chunks to GPT-4 as context
4. Generate an accurate, grounded answer based on the actual codebase

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

- `POST /api/index-local` - Index local XML file, upload to 0G if ZG_PRIVATE_KEY is available
- `POST /api/query` - Query the agent with a question
- `GET /api/status` - Check if index is built and get root hash

## Sharing with Your Team

After indexing, if you have `ZG_PRIVATE_KEY` configured, you'll see a green box with a root hash like:

```
📦 Stored on 0G Storage
0x1234567890abcdef...
Share this hash with teammates to instantly load the pre-computed embeddings!
```

**To use the shared embeddings:**

1. Copy the root hash from the green box
2. In Replit Secrets, add:
   - **Key**: `EMBEDDINGS_0G_ROOT_HASH`
   - **Value**: The root hash you copied
3. Refresh the page
4. The app will download embeddings from 0G Storage instead of re-indexing!

This saves time, money (no OpenAI API calls for embeddings), and ensures everyone uses the same index.

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
