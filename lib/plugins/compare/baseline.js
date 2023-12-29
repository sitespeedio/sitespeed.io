import fs from 'node:fs/promises';
import { join, resolve } from 'node:path';

export async function getBaseline(id, compareOptions) {
  try {
    return JSON.parse(
      await fs.readFile(
        resolve(
          join(compareOptions.baselinePath || process.cwd(), `${id}.json`)
        )
      )
    );
  } catch {
    return;
  }
}

export async function saveBaseline(json, name) {
  return fs.writeFile(resolve(name), JSON.stringify(json));
}
