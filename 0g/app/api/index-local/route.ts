import { NextResponse } from 'next/server'
import { buildIndex, type Chunk } from '@/lib/rag'
import * as path from 'path'
import * as fs from 'fs'

export async function POST() {
  try {
    const xmlPath = path.join(process.cwd(), 'repomix-output.xml')
    
    if (!fs.existsSync(xmlPath)) {
      return NextResponse.json(
        { success: false, error: 'repomix-output.xml not found' },
        { status: 404 }
      )
    }

    const chunks = await buildIndex(xmlPath, 1200, 200)
    
    const indexPath = path.join(process.cwd(), 'index-cache.json')
    const metaPath = path.join(process.cwd(), 'index-meta.json')
    fs.writeFileSync(indexPath, JSON.stringify(chunks))
    fs.writeFileSync(metaPath, JSON.stringify({ 
      rootHash: 'local-file', 
      chunks: chunks.length,
      source: 'local'
    }))

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      message: 'RAG index built successfully from local file',
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
