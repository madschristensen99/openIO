import { NextResponse } from 'next/server'
import { downloadFileFromZG } from '@/lib/storage'
import { buildIndex, type Chunk } from '@/lib/rag'
import * as path from 'path'
import * as fs from 'fs'

let indexCache: Chunk[] | null = null
let indexedRootHash: string | null = null

export async function POST(request: Request) {
  try {
    const { rootHash } = await request.json()

    if (!rootHash) {
      return NextResponse.json(
        { success: false, error: 'Root hash is required' },
        { status: 400 }
      )
    }

    const tempPath = path.join(process.cwd(), 'temp-download.xml')
    
    await downloadFileFromZG(rootHash, tempPath)
    
    const chunks = await buildIndex(tempPath, 1200, 200)
    
    indexCache = chunks
    indexedRootHash = rootHash
    
    const indexPath = path.join(process.cwd(), 'index-cache.json')
    const metaPath = path.join(process.cwd(), 'index-meta.json')
    fs.writeFileSync(indexPath, JSON.stringify(chunks))
    fs.writeFileSync(metaPath, JSON.stringify({ rootHash, chunks: chunks.length }))
    
    fs.unlinkSync(tempPath)

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      message: 'RAG index built successfully',
    })
  } catch (error: any) {
    console.error('Indexing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Indexing failed',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (!indexCache) {
    const indexPath = path.join(process.cwd(), 'index-cache.json')
    if (fs.existsSync(indexPath)) {
      const data = fs.readFileSync(indexPath, 'utf-8')
      indexCache = JSON.parse(data)
      const metaPath = path.join(process.cwd(), 'index-meta.json')
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        indexedRootHash = meta.rootHash
      }
    }
  }
  
  return NextResponse.json({
    indexed: indexCache !== null,
    chunks: indexCache?.length || 0,
    rootHash: indexedRootHash,
  })
}
