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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMetadataFiles = exports.uploadFolderToIPFS = void 0;
const sdk_1 = __importDefault(require("@pinata/sdk"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const index_1 = require("../../index");
function uploadFolderToIPFS(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const pinata = new sdk_1.default({
            // eslint-disable-next-line no-process-env
            pinataApiKey: process.env.PINATA_API_KEY,
            // eslint-disable-next-line no-process-env
            pinataSecretApiKey: process.env.PINATA_API_SECRET,
        });
        (0, index_1.print)(`${pinata} pinata`);
        let response;
        try {
            response = yield pinata.pinFromFS(folderPath);
        }
        catch (error) {
            (0, index_1.print)(`Error uploading folder to IPFS: ${(0, index_1.errorLike)(error)}`);
            throw error;
        }
        return response.IpfsHash;
    });
}
exports.uploadFolderToIPFS = uploadFolderToIPFS;
function updateMetadataFiles(metadataFolderPath, imagesIpfsHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = (0, fs_1.readdirSync)(metadataFolderPath);
        for (const filename of files) {
            const index = files.indexOf(filename);
            const filePath = path_1.default.join(metadataFolderPath, filename);
            const file = yield (0, promises_1.readFile)(filePath);
            const metadata = JSON.parse(file.toString());
            metadata.image =
                index != files.length - 1 ? `ipfs://${imagesIpfsHash}/${index}.jpg` : `ipfs://${imagesIpfsHash}/logo.jpg`;
            yield (0, promises_1.writeFile)(filePath, JSON.stringify(metadata));
        }
    });
}
exports.updateMetadataFiles = updateMetadataFiles;
