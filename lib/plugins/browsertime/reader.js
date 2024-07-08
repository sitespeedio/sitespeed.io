import { createReadStream } from 'node:fs';
import path from 'node:path';
import { gunzip as _gunzip } from 'node:zlib';
import { promisify } from 'node:util';
const gunzip = promisify(_gunzip);

async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('error', reject);
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function getGzippedFileAsJson(dir, file) {
  const readStream = createReadStream(path.join(dir, file));
  const text = await streamToString(readStream);
  const unzipped = await gunzip(text);
  return JSON.parse(unzipped.toString());
}
