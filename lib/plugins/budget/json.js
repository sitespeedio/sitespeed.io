import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { getLogger } from '@sitespeed.io/log';
const log = getLogger('sitespeedio.plugin.budget');

export function writeJson(results, dir) {
  const file = path.join(dir, 'budgetResult.json');
  log.info('Write budget to %s', path.resolve(file));
  writeFileSync(file, JSON.stringify(results, undefined, 2));
}
