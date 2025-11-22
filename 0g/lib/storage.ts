import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk'
import { ethers } from 'ethers'
import * as fs from 'fs'
import * as path from 'path'

const EVM_RPC = process.env.NEXT_PUBLIC_0G_EVM_RPC || 'https://evmrpc-testnet.0g.ai'
const INDEXER_RPC = process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai'
const PRIVATE_KEY = process.env.ZG_PRIVATE_KEY || ''

export async function uploadFileToZG(filePath: string): Promise<string> {
  if (!PRIVATE_KEY) {
    throw new Error('ZG_PRIVATE_KEY environment variable is required')
  }

  const provider = new ethers.JsonRpcProvider(EVM_RPC)
  const signer = new ethers.Wallet(PRIVATE_KEY, provider)
  const indexer = new Indexer(INDEXER_RPC)

  const file = await ZgFile.fromFilePath(filePath)
  const [tx, err] = await indexer.upload(file, EVM_RPC, signer)

  if (err !== null) {
    await file.close()
    throw new Error(`Upload failed: ${err}`)
  }

  const [tree, treeErr] = await file.merkleTree()
  if (treeErr !== null) {
    await file.close()
    throw new Error(`Failed to get merkle tree: ${treeErr}`)
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
