import { existsSync, writeFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import path from 'node:path';
import https from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_URL2GREEN_URL =
  'https://raw.githubusercontent.com/sitespeedio/url2green/main/url2green.json.gz';

const URL2GREEN_FILE_PATH = `${__dirname}/../lib/plugins/sustainable/data/url2green.json.gz`;

const DOWNLOAD_URL2GREEN = process.env.DOWNLOAD_URL2GREEN || 'false';

function downloadFile(url, destinationPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }

        const fileChunks = [];
        response.on('data', chunk => fileChunks.push(chunk));
        response.on('end', () => {
          try {
            const fileBuffer = Buffer.concat(fileChunks);
            mkdirSync(path.dirname(destinationPath), { recursive: true });
            writeFileSync(destinationPath, fileBuffer);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

async function run() {
  if (DOWNLOAD_URL2GREEN === 'true') {
    if (existsSync(URL2GREEN_FILE_PATH)) {
      console.log('URL2GREEN file already exists. Skipping download.');
    } else {
      console.log('URL2GREEN file is missing. Downloading...');
      try {
        await downloadFile(DEFAULT_URL2GREEN_URL, URL2GREEN_FILE_PATH);
        console.log('URL2GREEN file downloaded successfully.');
      } catch (error) {
        console.error('Failed to download URL2GREEN file:', error.message);
      }
    }
  } else {
    console.log('Skipping URL2GREEN file download (DOWNLOAD_URL2GREEN=false).');
  }
}

await run();
