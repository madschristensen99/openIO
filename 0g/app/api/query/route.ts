import { NextResponse } from 'next/server'
import { semanticSearch, generateAnswer } from '@/lib/rag'
import * as path from 'path'
import * as fs from 'fs'

let indexCache: any[] | null = null

function loadIndex() {
  const indexPath = path.join(process.cwd(), 'index-cache.json')
  if (fs.existsSync(indexPath)) {
    const data = fs.readFileSync(indexPath, 'utf-8')
    indexCache = JSON.parse(data)
  }
}

export async function POST(request: Request) {
  try {
    const { question, chatHistory = [] } = await request.json()

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    if (!indexCache) {
      loadIndex()
    }

    if (!indexCache || indexCache.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Index not built yet. Please index the file first.' },
        { status: 400 }
      )
    }

    const relevantChunks = await semanticSearch(question, indexCache, 5)
    
    const contextTexts = relevantChunks.map(chunk => chunk.content)
    
    const answer = await generateAnswer(question, contextTexts, chatHistory)

    return NextResponse.json({
      success: true,
      answer,
      chunksUsed: relevantChunks.length,
    })
  } catch (error: any) {
    console.error('Query error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Query failed',
      },
      { status: 500 }
    )
  }
}
