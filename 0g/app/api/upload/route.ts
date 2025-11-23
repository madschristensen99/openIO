import { NextResponse } from 'next/server'
import { uploadFileToZG } from '@/lib/storage'
import * as path from 'path'

export async function POST() {
  try {
    const xmlPath = path.join(process.cwd(), 'repomix-output.xml')
    
    const rootHash = await uploadFileToZG(xmlPath)
    
    return NextResponse.json({
      success: true,
      rootHash,
      message: 'File uploaded successfully to 0G Storage',
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Upload failed',
      },
      { status: 500 }
    )
  }
}
