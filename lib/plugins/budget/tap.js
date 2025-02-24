import path from 'node:path';
import fs from 'node:fs';
import { EOL } from 'node:os';
import { getLogger } from '@sitespeed.io/log';

const log = getLogger('sitespeedio.plugin.budget');

export function writeTap(results, dir) {
  const file = path.join(dir, 'budget.tap');
  log.info('Write budget to %s', path.resolve(file));

  const lines = [];
  lines.push('TAP version 13');
  let testCount = 0;

  // Iterate over each result group (e.g. "passing" and "failing")
  for (const resultType of Object.keys(results)) {
    const group = results[resultType];
    if (!group) {
      continue;
    }
    const urls = Object.keys(group);
    for (const url of urls) {
      for (const result of group[url]) {
        testCount += 1;
        const testTitle = `${result.type}.${result.metric} ${url}`;
        let extra = '';
        if (resultType === 'failing') {
          extra = ` limit ${result.limitType} ${result.friendlyLimit || result.limit}`;
        }
        const valueDisplay = result.friendlyValue || result.value;

        lines.push(`# ${testTitle}`);
        const status = resultType === 'failing' ? 'not ok' : 'ok';
        lines.push(
          `${status} ${testCount} ${testTitle} ${valueDisplay}${extra ? ` ${extra}` : ''}`
        );
      }
    }
  }

  lines.push(`1..${testCount}`);
  fs.writeFileSync(file, lines.join(EOL) + EOL);
}
