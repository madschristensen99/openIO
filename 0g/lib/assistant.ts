/**
 * Server-only helper that loads/caches the repo embeddings and asks OpenAI for an answer.
 * Use from a Next.js route (e.g. app/api/*) by importing askOpenIOAssistant and calling it with a user message.
 */
import * as fs from 'fs'
import * as path from 'path'
import { downloadJSONFrom0G } from './storage'
import { semanticSearch, generateAnswer, buildIndex, type Chunk } from './rag'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const INDEX_CACHE_PATH = path.join(process.cwd(), 'index-cache.json')
const EMBEDDINGS_0G_ROOT_HASH = process.env.EMBEDDINGS_0G_ROOT_HASH

let cachedChunks: Chunk[] | null = null
let loadingPromise: Promise<Chunk[]> | null = null

async function loadEmbeddings(): Promise<Chunk[]> {
  if (cachedChunks) return cachedChunks
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    if (fs.existsSync(INDEX_CACHE_PATH)) {
      const data = fs.readFileSync(INDEX_CACHE_PATH, 'utf-8')
      cachedChunks = JSON.parse(data)
      return cachedChunks
    }

    if (EMBEDDINGS_0G_ROOT_HASH) {
      const downloaded = await downloadJSONFrom0G(EMBEDDINGS_0G_ROOT_HASH)
      cachedChunks = downloaded

      try {
        fs.writeFileSync(INDEX_CACHE_PATH, JSON.stringify(downloaded))
      } catch {
        // Best-effort cache write; keep in-memory cache even if the write fails.
      }

      return cachedChunks
    }

    const repoMixPath = path.join(process.cwd(), '0g', 'repomix-output.xml')
    if (fs.existsSync(repoMixPath)) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required to build embeddings from repomix-output.xml')
      }

      const built = await buildIndex(repoMixPath, 1200, 200)
      cachedChunks = built

      try {
        fs.writeFileSync(INDEX_CACHE_PATH, JSON.stringify(built))
      } catch {
        // Best-effort cache write; keep in-memory cache even if the write fails.
      }

      return cachedChunks
    }

    throw new Error('No embeddings index found. Build the index or set EMBEDDINGS_0G_ROOT_HASH.')
  })()

  try {
    return await loadingPromise
  } finally {
    loadingPromise = null
  }
}

export async function askOpenIOAssistant(
  userMessage: string,
  options?: {
    page?: 'builder' | 'deploy'
    history?: ChatMessage[]
  }
): Promise<string> {
  if (!userMessage?.trim()) {
    throw new Error('userMessage is required')
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required to call OpenAI')
  }

  const { page, history = [] } = options || {}

  const embeddings = await loadEmbeddings()

  if (!embeddings.length) {
    throw new Error('Embeddings index is empty. Run indexing before asking questions.')
  }

  const relevantChunks = await semanticSearch(userMessage, embeddings, 5)
  const contextTexts = relevantChunks.map(chunk => chunk.content)

  const question = page ? `Page: ${page}\n\n${userMessage}` : userMessage

  return generateAnswer(
    question,
    contextTexts,
    history.map(msg => ({ role: msg.role, content: msg.content }))
  )
}
