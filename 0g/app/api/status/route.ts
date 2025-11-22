import { NextResponse } from 'next/server'
import * as path from 'path'
import * as fs from 'fs'

export async function GET() {
  const indexPath = path.join(process.cwd(), 'index-cache.json')
  const indexed = fs.existsSync(indexPath)
  
  let rootHash = null
  let chunks = 0
  
  if (indexed) {
    try {
      const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      chunks = data.length
      const metaPath = path.join(process.cwd(), 'index-meta.json')
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        rootHash = meta.rootHash
      }
    } catch (e) {
      console.error('Error reading index:', e)
    }
  }

  return NextResponse.json({
    indexed,
    rootHash,
    chunks,
  })
}
