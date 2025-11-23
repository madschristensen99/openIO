import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk'
import { ethers } from 'ethers'
import * as fs from 'fs'
import * as path from 'path'

const EVM_RPC = process.env.NEXT_PUBLIC_0G_EVM_RPC || 'https://evmrpc-testnet.0g.ai'
const INDEXER_RPC = process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai'
const PRIVATE_KEY = process.env.ZG_PRIVATE_KEY || ''

export async function uploadJSONTo0G(data: any, tempFileName: string = 'embeddings.json'): Promise<string> {
  if (!PRIVATE_KEY) {
    throw new Error('ZG_PRIVATE_KEY environment variable is required')
  }

  const tempPath = path.join('/tmp', tempFileName)
  fs.writeFileSync(tempPath, JSON.stringify(data))

  try {
    const provider = new ethers.JsonRpcProvider(EVM_RPC)
    const signer = new ethers.Wallet(PRIVATE_KEY, provider)
    const indexer = new Indexer(INDEXER_RPC)

    const file = await ZgFile.fromFilePath(tempPath)
    // 0g-ts-sdk expects a v5-style Signer type; cast to avoid the v6 ESM/CommonJS type mismatch.
    const [tx, err] = await indexer.upload(file, EVM_RPC, signer as any)

    if (err !== null) {
      await file.close()
      throw new Error(`Upload failed: ${err}`)
    }

    const [tree, treeErr] = await file.merkleTree()
    if (treeErr !== null || !tree) {
      await file.close()
      throw new Error(`Failed to get merkle tree: ${treeErr ?? 'tree is null'}`)
    }

    const rootHash = tree.rootHash()
    await file.close()

    fs.unlinkSync(tempPath)
    return rootHash
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    throw error
  }
}

export async function downloadJSONFrom0G(rootHash: string): Promise<any> {
  const indexer = new Indexer(INDEXER_RPC)
  const tempPath = path.join('/tmp', `download-${Date.now()}.json`)

  const err = await indexer.download(rootHash, tempPath, false)

  if (err !== null) {
    throw new Error(`Download failed: ${err}`)
  }

  try {
    const data = JSON.parse(fs.readFileSync(tempPath, 'utf-8'))
    fs.unlinkSync(tempPath)
    return data
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    throw error
  }
}

export async function uploadFileToZG(filePath: string): Promise<string> {
  if (!PRIVATE_KEY) {
    throw new Error('ZG_PRIVATE_KEY environment variable is required')
  }

  const provider = new ethers.JsonRpcProvider(EVM_RPC)
  const signer = new ethers.Wallet(PRIVATE_KEY, provider)
  const indexer = new Indexer(INDEXER_RPC)

  const file = await ZgFile.fromFilePath(filePath)
  // 0g-ts-sdk expects a v5-style Signer type; cast to avoid the v6 ESM/CommonJS type mismatch.
  const [tx, err] = await indexer.upload(file, EVM_RPC, signer as any)

  if (err !== null) {
    await file.close()
    throw new Error(`Upload failed: ${err}`)
  }

  const [tree, treeErr] = await file.merkleTree()
  if (treeErr !== null || !tree) {
    await file.close()
    throw new Error(`Failed to get merkle tree: ${treeErr ?? 'tree is null'}`)
  }

  const rootHash = tree.rootHash()
  await file.close()

  return rootHash
}

export async function downloadFileFromZG(rootHash: string, outputPath: string): Promise<void> {
  const indexer = new Indexer(INDEXER_RPC)
  const err = await indexer.download(rootHash, outputPath, false)

  if (err !== null) {
    throw new Error(`Download failed: ${err}`)
  }
}
