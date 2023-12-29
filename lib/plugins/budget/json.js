import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import intel from 'intel';
const log = intel.getLogger('sitespeedio.plugin.budget');

export function writeJson(results, dir) {
  const file = join(dir, 'budgetResult.json');
  log.info('Write budget to %s', resolve(file));
  writeFileSync(file, JSON.stringify(results, undefined, 2));
}
