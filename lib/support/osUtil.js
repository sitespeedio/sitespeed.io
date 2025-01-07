import os from 'node:os';
import { promises as fsPromises } from 'node:fs';

export function osName() {
  const platform = os.platform();
  if (platform === 'win32') return 'Windows';
  if (platform === 'darwin') return 'macOS';
  if (platform === 'linux') return 'Linux';
  return platform;
}

export async function getOS() {
  if (os.platform() !== 'linux') {
    return { dist: osName(), release: '' };
  }

  try {
    const data = await fsPromises.readFile('/etc/os-release', 'utf8');
    const lines = data.split('\n');
    let dist = 'Linux';
    let release = '';

    for (const line of lines) {
      if (line.startsWith('NAME=')) {
        dist = line.split('=')[1].replaceAll('"', '');
      } else if (line.startsWith('VERSION_ID=')) {
        release = line.split('=')[1].replaceAll('"', '');
      }
    }

    return { dist, release };
  } catch {
    // Return fallback values if reading fails
    return { dist: 'Linux', release: '' };
  }
}
