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
/*
async function getBaselineFromInternet(url) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    log.error('Could not fetch', error);
  }
}

async function getBaselineFromFile(path) {}

/*
export async function saveBaseline(json, options) {

}*/
export async function saveBaseline(json, name) {
  return fs.writeFile(resolve(name), JSON.stringify(json));
}
