# 0G RAG Agent - Diamond IO Codebase Expert

A Next.js application that implements a Retrieval-Augmented Generation (RAG) agent to answer technical questions about the Diamond IO codebase using AI-powered semantic search.

## Features

- **Automatic Indexing**: Automatically indexes the local `repomix-output.xml` file on first load
- **RAG Pipeline**: Chunking, embedding, and semantic search powered by OpenAI
- **Chat Interface**: Clean, intuitive chat interface for querying the codebase
- **AI Agent**: GPT-4 powered expert that provides accurate answers with context from the indexed code
- **Optional 0G Storage**: Advanced users can optionally upload to decentralized 0G Storage

## Prerequisites

- **OpenAI API Key**: Required for embeddings (text-embedding-3-small) and chat completions (GPT-4)

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

### 3. Run the Application

The application is already running! It will automatically:
1. Check if the codebase is already indexed
2. If not, automatically index the `repomix-output.xml` file
3. Open the chat interface when ready

## How It Works

### Automatic Initialization

When you first load the page, the application:
1. Loads the local `repomix-output.xml` file containing the Diamond IO codebase
2. Chunks the XML into 1200-character pieces with 200-character overlap
3. Generates vector embeddings using OpenAI's `text-embedding-3-small` model
4. Stores the indexed chunks locally for fast semantic search
5. Displays "Ready • X chunks indexed" when complete

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
