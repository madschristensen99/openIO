import { NextResponse } from 'next/server'
import { buildIndex, type Chunk } from '@/lib/rag'
import { uploadJSONTo0G, downloadJSONFrom0G } from '@/lib/storage'
import * as path from 'path'
import * as fs from 'fs'

const EMBEDDINGS_ROOT_HASH_ENV = process.env.EMBEDDINGS_0G_ROOT_HASH || ''

export async function POST() {
  try {
    const metaPath = path.join(process.cwd(), 'index-meta.json')
    const indexPath = path.join(process.cwd(), 'index-cache.json')

    if (EMBEDDINGS_ROOT_HASH_ENV) {
      console.log('Attempting to load pre-computed embeddings from 0G Storage...')
      try {
        const chunks = await downloadJSONFrom0G(EMBEDDINGS_ROOT_HASH_ENV)
        
        fs.writeFileSync(indexPath, JSON.stringify(chunks))
        fs.writeFileSync(metaPath, JSON.stringify({
          rootHash: EMBEDDINGS_ROOT_HASH_ENV,
          chunks: chunks.length,
          source: '0g-storage'
        }))

        console.log(`Loaded ${chunks.length} chunks from 0G Storage`)
        return NextResponse.json({
          success: true,
          chunks: chunks.length,
          rootHash: EMBEDDINGS_ROOT_HASH_ENV,
          message: 'Loaded pre-computed embeddings from 0G Storage',
          source: '0g-storage'
        })
      } catch (err: any) {
        console.warn('Failed to load from 0G, falling back to local indexing:', err)
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json({
            success: false,
            error: 'Failed to download from 0G Storage and OPENAI_API_KEY is missing. Either provide a valid OPENAI_API_KEY for local indexing or check your EMBEDDINGS_0G_ROOT_HASH.',
          }, { status: 500 })
        }
      }
    }

    const xmlPath = path.join(process.cwd(), 'repomix-output.xml')
    
    if (!fs.existsSync(xmlPath)) {
      return NextResponse.json(
        { success: false, error: 'repomix-output.xml not found' },
        { status: 404 }
      )
    }

    console.log('Building index from local XML file...')
    const chunks = await buildIndex(xmlPath, 1200, 200)
    
    fs.writeFileSync(indexPath, JSON.stringify(chunks))

    let rootHash = 'local-only'
    let uploadedTo0G = false

    if (process.env.ZG_PRIVATE_KEY) {
      try {
        console.log('Uploading embeddings to 0G Storage...')
        rootHash = await uploadJSONTo0G(chunks, `dio-embeddings-${Date.now()}.json`)
        uploadedTo0G = true
        console.log(`Uploaded to 0G Storage with root hash: ${rootHash}`)
      } catch (err: any) {
        console.warn('Failed to upload to 0G Storage:', err)
        const uploadError = err.message || 'Unknown error'
        fs.writeFileSync(metaPath, JSON.stringify({ 
          rootHash: 'local-only', 
          chunks: chunks.length,
          source: 'local-only',
          uploadError
        }))
        
        return NextResponse.json({
          success: true,
          chunks: chunks.length,
          message: `Indexed locally, but failed to upload to 0G Storage: ${uploadError}`,
          uploadError
        })
      }
    }

    fs.writeFileSync(metaPath, JSON.stringify({ 
      rootHash, 
      chunks: chunks.length,
      source: uploadedTo0G ? '0g-uploaded' : 'local-only'
    }))

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      rootHash: uploadedTo0G ? rootHash : undefined,
      message: uploadedTo0G 
        ? `Indexed and uploaded to 0G Storage! Share this hash: ${rootHash}`
        : 'Indexed locally (0G upload unavailable)',
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
