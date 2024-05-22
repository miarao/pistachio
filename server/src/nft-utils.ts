import { readdir } from 'fs/promises'
import { toNano } from 'ton-core'

import { NftCollection } from './contracts/NftCollection'
import { NftItem } from './contracts/NftItem'
import { NftMarketplace } from './contracts/NftMarketplace'
import { waitSeqno } from './delay'
import { updateMetadataFiles, uploadFolderToIPFS } from './metadata'
import { openWallet } from './utils'

export async function mintMotherfucker(flare: string) {
  const metadataFolderPath = './data/metadata/'
  const imagesFolderPath = './data/images/'

  const wallet = await openWallet(process.env.MNEMONIC!.split(' '), true)

  console.log('Started uploading images to IPFS...')
  const imagesIpfsHash = await uploadFolderToIPFS(imagesFolderPath)
  console.log(`Successfully uploaded the pictures to ipfs: https://gateway.pinata.cloud/ipfs/${imagesIpfsHash}`)

  console.log('Started uploading metadata files to IPFS...')
  await updateMetadataFiles(metadataFolderPath, imagesIpfsHash)
  const metadataIpfsHash = await uploadFolderToIPFS(metadataFolderPath)
  console.log(`Successfully uploaded the metadata to ipfs: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`)

  console.log('Start deploy of nft collection...')
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
  console.log(`Collection deployed: ${collection.address}`)
  await waitSeqno(seqno, wallet)

  // Deploy nft items
  const files = await readdir(metadataFolderPath)

  seqno = await collection.topUpBalance(wallet, files.length)
  await waitSeqno(seqno, wallet)
  console.log(`Balance top-upped`)

  console.log(`Start deploy of NFT`)
  const mintParams = {
    queryId: 0,
    itemOwnerAddress: wallet.contract.address,
    itemIndex: 0,
    amount: toNano('0.05'),
    commonContentUrl: files[0],
  }

  const nftItem = new NftItem(collection)
  seqno = await nftItem.deploy(wallet, mintParams)
  console.log(`Successfully deployed NFT`)
  await waitSeqno(seqno, wallet)

  console.log('Start deploy of new marketplace  ')
  const marketplace = new NftMarketplace(wallet.contract.address)
  seqno = await marketplace.deploy(wallet)
  await waitSeqno(seqno, wallet)
  console.log('Successfully deployed new marketplace')

  // const nftToSaleAddress = await NftItem.getAddressByIndex(collection.address, 0);
  // const saleData: GetGemsSaleData = {
  //   isComplete: false,
  //   createdAt: Math.ceil(Date.now() / 1000),
  //   marketplaceAddress: marketplace.address,
  //   nftAddress: nftToSaleAddress,
  //   nftOwnerAddress: null,
  //   fullPrice: toNano("10"),
  //   marketplaceFeeAddress: wallet.contract.address,
  //   marketplaceFee: toNano("1"),
  //   royaltyAddress: wallet.contract.address,
  //   royaltyAmount: toNano("0.5"),
  // };
  // const nftSaleContract = new NftSale(saleData);
  // seqno = await nftSaleContract.deploy(wallet);
  // await waitSeqno(seqno, wallet);

  // await NftItem.transfer(wallet, nftToSaleAddress, nftSaleContract.address);
}
