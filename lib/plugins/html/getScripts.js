import { readFile as _readFile } from 'node:fs';
import { promisify } from 'node:util';
const readFile = promisify(_readFile);

export default async function getScripts(options) {
  const scripts = [];
  for (let file of options._) {
    // We could promise all these in the future
    if (!file.startsWith('http')) {
      try {
        const code = await readFile(file);
        scripts.push({ name: file, code: code });
      } catch {
        // do nada
      }
    }
  }
  return scripts;
}
