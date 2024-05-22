"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintMotherfucker = void 0;
const promises_1 = require("fs/promises");
const ton_core_1 = require("ton-core");
const NftCollection_1 = require("./contracts/NftCollection");
const NftItem_1 = require("./contracts/NftItem");
const NftMarketplace_1 = require("./contracts/NftMarketplace");
const delay_1 = require("./delay");
const metadata_1 = require("./metadata");
const utils_1 = require("./utils");
function mintMotherfucker(flare) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadataFolderPath = './data/metadata/';
        const imagesFolderPath = './data/images/';
        const wallet = yield (0, utils_1.openWallet)(process.env.MNEMONIC.split(' '), true);
        console.log('Started uploading images to IPFS...');
        const imagesIpfsHash = yield (0, metadata_1.uploadFolderToIPFS)(imagesFolderPath);
        console.log(`Successfully uploaded the pictures to ipfs: https://gateway.pinata.cloud/ipfs/${imagesIpfsHash}`);
        console.log('Started uploading metadata files to IPFS...');
        yield (0, metadata_1.updateMetadataFiles)(metadataFolderPath, imagesIpfsHash);
        const metadataIpfsHash = yield (0, metadata_1.uploadFolderToIPFS)(metadataFolderPath);
        console.log(`Successfully uploaded the metadata to ipfs: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`);
        console.log('Start deploy of nft collection...');
        const collectionData = {
            ownerAddress: wallet.contract.address,
            royaltyPercent: 0.05, // 0.05 = 5%
            royaltyAddress: wallet.contract.address,
            nextItemIndex: 0,
            collectionContentUrl: `ipfs://${metadataIpfsHash}/collection.json`,
            commonContentUrl: `ipfs://${metadataIpfsHash}/`,
        };
        const collection = new NftCollection_1.NftCollection(collectionData);
        let seqno = yield collection.deploy(wallet);
        console.log(`Collection deployed: ${collection.address}`);
        yield (0, delay_1.waitSeqno)(seqno, wallet);
        // Deploy nft items
        const files = yield (0, promises_1.readdir)(metadataFolderPath);
        seqno = yield collection.topUpBalance(wallet, files.length);
        yield (0, delay_1.waitSeqno)(seqno, wallet);
        console.log(`Balance top-upped`);
        console.log(`Start deploy of NFT`);
        const mintParams = {
            queryId: 0,
            itemOwnerAddress: wallet.contract.address,
            itemIndex: 0,
            amount: (0, ton_core_1.toNano)('0.05'),
            commonContentUrl: files[0],
        };
        const nftItem = new NftItem_1.NftItem(collection);
        seqno = yield nftItem.deploy(wallet, mintParams);
        console.log(`Successfully deployed NFT`);
        yield (0, delay_1.waitSeqno)(seqno, wallet);
        console.log('Start deploy of new marketplace  ');
        const marketplace = new NftMarketplace_1.NftMarketplace(wallet.contract.address);
        seqno = yield marketplace.deploy(wallet);
        yield (0, delay_1.waitSeqno)(seqno, wallet);
        console.log('Successfully deployed new marketplace');
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
    });
}
exports.mintMotherfucker = mintMotherfucker;
