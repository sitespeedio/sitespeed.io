import { readdir } from 'node:fs/promises';
import path from 'node:path';

export async function recursiveReaddir(dir, ignoreDirectories = false) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoreDirectories) {
        results.push(fullPath);
      }
      const subPaths = await recursiveReaddir(fullPath, ignoreDirectories);
      results.push(...subPaths);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}
