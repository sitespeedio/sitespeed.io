'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const gunzip = promisify(zlib.gunzip);

async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('error', reject);
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

module.exports = {
  async getGzippedFileAsJson(dir, file) {
    const readStream = fs.createReadStream(path.join(dir, file));
    const text = await streamToString(readStream);
    const unzipped = await gunzip(text);
    return JSON.parse(unzipped.toString());
  }
};
