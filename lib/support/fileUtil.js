import { readdir } from 'node:fs/promises';
import path from 'node:path';

export async function recursiveReaddir(dir, includeDirectories = false) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (includeDirectories) {
        results.push(fullPath);
      }
      const subPaths = await recursiveReaddir(fullPath, includeDirectories);
      results.push(...subPaths);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}
