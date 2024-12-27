import fs from 'node:fs/promises';
import path from 'node:path';

export async function getBaseline(id, compareOptions) {
  try {
    return JSON.parse(
      await fs.readFile(
        path.resolve(
          path.join(compareOptions.baselinePath || process.cwd(), `${id}.json`)
        )
      )
    );
  } catch {
    return;
  }
}

export async function saveBaseline(json, name) {
  return fs.writeFile(path.resolve(name), JSON.stringify(json));
}
