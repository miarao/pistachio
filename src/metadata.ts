import pinataSDK from "@pinata/sdk";
import { readdirSync } from "fs";
import { writeFile, readFile } from "fs/promises";
import path from "path";

export async function uploadFolderToIPFS(folderPath: string): Promise<string> {
  const pinata = new pinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_API_SECRET,
  });

  console.log(pinata, 'pinata');
  console.log(folderPath, 'folderPath');

  let response;
  try {
    response = await pinata.pinFromFS(folderPath);
    console.log('SUCCESS!');
  } catch (error) {
    console.error('Error uploading folder to IPFS:', error);
    console.log('ERROR!');
    throw error;
  }
  return response.IpfsHash;
}

const imageByFile: { [key: string]: string } = {
  collection: 'logo.jpg',
  runners: 'runners.png',
  sports: 'sports.png',
}

export async function updateMetadataFiles(
  metadataFolderPath: string,
  imagesIpfsHash: string
): Promise<void> {
  const files = readdirSync(metadataFolderPath);

  files.forEach(async (filename, index) => {
    console.log(filename, 'filename');
    const filePath = path.join(metadataFolderPath, filename);
    const file = await readFile(filePath);

    const metadata = JSON.parse(file.toString());
    metadata.image = `ipfs://${imagesIpfsHash}/${imageByFile[filename.split('.')[0]]}`;

    await writeFile(filePath, JSON.stringify(metadata));
  });
}
