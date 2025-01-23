import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export async function recursiveReaddir(dir, skipDirectories = false) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (skipDirectories) {
        continue;
      }
      const subPaths = await recursiveReaddir(fullPath, skipDirectories);
      results.push(...subPaths);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

export function findUpSync(filenames, startDir = process.cwd()) {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    for (const filename of filenames) {
      const filePath = path.resolve(currentDir, filename);
      if (existsSync(filePath)) {
        return filePath;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return;
}
