import pinataSDK from '@pinata/sdk'
import { readdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

import { errorLike, print } from '../../index'

export async function uploadFolderToIPFS(folderPath: string): Promise<string> {
  const pinata = new pinataSDK({
    // eslint-disable-next-line no-process-env
    pinataApiKey: process.env.PINATA_API_KEY,
    // eslint-disable-next-line no-process-env
    pinataSecretApiKey: process.env.PINATA_API_SECRET,
  })

  print(`${pinata} pinata`)

  let response
  try {
    response = await pinata.pinFromFS(folderPath)
  } catch (error) {
    print(`Error uploading folder to IPFS: ${errorLike(error)}`)
    throw error
  }
  return response.IpfsHash
}

export async function updateMetadataFiles(metadataFolderPath: string, imagesIpfsHash: string): Promise<void> {
  const files = readdirSync(metadataFolderPath)

  for (const filename of files) {
    const index = files.indexOf(filename)
    const filePath = path.join(metadataFolderPath, filename)
    const file = await readFile(filePath)

    const metadata = JSON.parse(file.toString())
    metadata.image =
      index != files.length - 1 ? `ipfs://${imagesIpfsHash}/${index}.jpg` : `ipfs://${imagesIpfsHash}/logo.jpg`

    await writeFile(filePath, JSON.stringify(metadata))
  }
}
