import OpenAI from 'openai'
import * as fs from 'fs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing-key',
})

export interface Chunk {
  content: string
  embedding: number[]
  index: number
}

export async function chunkDocument(content: string, chunkSize: number = 1200, overlap: number = 200): Promise<string[]> {
  const chunks: string[] = []
  let start = 0

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length)
    chunks.push(content.substring(start, end))
    start += chunkSize - overlap
  }

  return chunks
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    // Return empty embeddings when API key is missing (for build)
    return texts.map(() => Array(1536).fill(0))
  }
  
  const BATCH_SIZE = 100
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    })
    allEmbeddings.push(...response.data.map(d => d.embedding))
  }

  return allEmbeddings
}

export async function buildIndex(filePath: string, chunkSize: number = 1200, overlap: number = 200): Promise<Chunk[]> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const textChunks = await chunkDocument(content, chunkSize, overlap)
  const embeddings = await createEmbeddings(textChunks)

  const chunks: Chunk[] = textChunks.map((content, index) => ({
    content,
    embedding: embeddings[index],
    index,
  }))

  return chunks
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

export async function semanticSearch(query: string, chunks: Chunk[], topK: number = 5): Promise<Chunk[]> {
  if (!process.env.OPENAI_API_KEY) {
    // Return empty results when API key is missing
    return []
  }
  
  const queryEmbedding = await createEmbeddings([query])
  const queryVec = queryEmbedding[0]

  const scored = chunks.map(chunk => ({
    chunk,
    similarity: cosineSimilarity(queryVec, chunk.embedding),
  }))

  scored.sort((a, b) => b.similarity - a.similarity)
  return scored.slice(0, topK).map(s => s.chunk)
}

export async function generateAnswer(
  question: string,
  context: string[],
  chatHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "OpenAI API key is required. Please set the OPENAI_API_KEY environment variable."
  }
  
  const contextText = context.join('\n\n---\n\n')
  
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a Rust and cryptography expert specializing in the MachinaIO diamond-io system.
Use the provided context when it contains relevant details; cite files, structs, or functions when you can.
If the context is missing or irrelevant, still answer using your broader web3/solidity knowledge, and briefly note that you are answering with general guidance.
Keep answers concise and actionable.

Context from codebase (may be empty or unrelated):
${contextText || 'No context available.'}`,
    },
  ]

  chatHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })
  })

  messages.push({
    role: 'user',
    content: question,
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.3,
    max_tokens: 1000,
  })

  return response.choices[0].message.content || 'No response generated'
}
