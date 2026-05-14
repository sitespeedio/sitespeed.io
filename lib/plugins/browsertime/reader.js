import { createReadStream } from 'node:fs';
import path from 'node:path';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

// Read a gzipped JSON file and return the parsed object.
//
// Streams the file through createGunzip instead of buffering the whole
// gzipped payload, gunzipping the whole buffer in one shot and then
// stringifying it. Chrome traces and HARs are routinely 50+ MB, so the
// old "chunks -> Buffer.concat -> gunzip(buf) -> toString -> JSON.parse"
// path peaked at gzipped + unzipped + string + object all alive at once.
// The new path keeps only the unzipped text chunks plus the parsed object.
export async function getGzippedFileAsJson(dir, file) {
  const chunks = [];
  const gunzip = createGunzip();
  gunzip.setEncoding('utf8');
  gunzip.on('data', chunk => chunks.push(chunk));
  await pipeline(createReadStream(path.join(dir, file)), gunzip);
  return JSON.parse(chunks.join(''));
}
