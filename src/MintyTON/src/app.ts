import * as dotenv from 'dotenv'
import { readdir } from 'fs/promises'
import { toNano } from 'ton-core'

import { print } from '../../index'
import { NftCollection } from './contracts/NftCollection'
import { NftItem } from './contracts/NftItem'
import { NftMarketplace } from './contracts/NftMarketplace'
import { GetGemsSaleData, NftSale } from './contracts/NftSale'
import { waitSeqno } from './delay'
import { updateMetadataFiles, uploadFolderToIPFS } from './metadata'
import { openWallet } from './utils'

dotenv.config()

async function init() {
  const metadataFolderPath = './data/metadata/'
  const imagesFolderPath = './data/images/'

  // eslint-disable-next-line no-process-env
  const wallet = await openWallet(process.env.MNEMONIC!.split(' '), true)

  print('Started uploading images to IPFS...')
  const imagesIpfsHash = await uploadFolderToIPFS(imagesFolderPath)
  print(`Successfully uploaded the pictures to ipfs: https://gateway.pinata.cloud/ipfs/${imagesIpfsHash}`)

  print('Started uploading metadata files to IPFS...')
  await updateMetadataFiles(metadataFolderPath, imagesIpfsHash)
  const metadataIpfsHash = await uploadFolderToIPFS(metadataFolderPath)
  print(`Successfully uploaded the metadata to ipfs: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`)

  print('Start deploy of nft collection...')
  const collectionData = {
    ownerAddress: wallet.contract.address,
    royaltyPercent: 0.05, // 0.05 = 5%
    royaltyAddress: wallet.contract.address,
    nextItemIndex: 0,
    collectionContentUrl: `ipfs://${metadataIpfsHash}/collection.json`,
    commonContentUrl: `ipfs://${metadataIpfsHash}/`,
  }
  const collection = new NftCollection(collectionData)
  let seqno = await collection.deploy(wallet)
  print(`Collection deployed: ${collection.address}`)
  await waitSeqno(seqno, wallet)

  // Deploy nft items
  const files = await readdir(metadataFolderPath)
  files.pop()
  let index = 0

  seqno = await collection.topUpBalance(wallet, files.length)
  await waitSeqno(seqno, wallet)
  print(`Balance top-upped`)

  for (const file of files) {
    print(`Start deploy of ${index + 1} NFT`)
    const mintParams = {
      queryId: 0,
      itemOwnerAddress: wallet.contract.address,
      itemIndex: index,
      amount: toNano('0.05'),
      commonContentUrl: file,
    }
    const nftItem = new NftItem(collection)
    seqno = await nftItem.deploy(wallet, mintParams)
    print(`Successfully deployed ${index + 1} NFT`)
    await waitSeqno(seqno, wallet)
    index++
  }

  print('Start deploy of new marketplace  ')
  const marketplace = new NftMarketplace(wallet.contract.address)
  seqno = await marketplace.deploy(wallet)
  await waitSeqno(seqno, wallet)
  print('Successfully deployed new marketplace')

  const nftToSaleAddress = await NftItem.getAddressByIndex(collection.address, 0)
  const saleData: GetGemsSaleData = {
    isComplete: false,
    createdAt: Math.ceil(Date.now() / 1000),
    marketplaceAddress: marketplace.address,
    nftAddress: nftToSaleAddress,
    nftOwnerAddress: null,
    fullPrice: toNano('10'),
    marketplaceFeeAddress: wallet.contract.address,
    marketplaceFee: toNano('1'),
    royaltyAddress: wallet.contract.address,
    royaltyAmount: toNano('0.5'),
  }
  const nftSaleContract = new NftSale(saleData)
  seqno = await nftSaleContract.deploy(wallet)
  await waitSeqno(seqno, wallet)

  await NftItem.transfer(wallet, nftToSaleAddress, nftSaleContract.address)
}

void init()
