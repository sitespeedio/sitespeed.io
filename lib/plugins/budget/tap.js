import path from 'node:path';
import fs from 'node:fs';
import { EOL } from 'node:os';
import tap from 'tape';
import intel from 'intel';
const log = intel.getLogger('sitespeedio.plugin.budget');

export function writeTap(results, dir) {
  const file = path.join(dir, 'budget.tap');
  log.info('Write budget to %s', path.resolve(file));
  const tapOutput = fs.createWriteStream(file);
  tap.createStream().pipe(tapOutput);

  for (const resultType of Object.keys(results)) {
    const urls = Object.keys(results.failing);

    for (const url of urls) {
      for (const result of results.failing[url]) {
        tap(result.type + '.' + result.metric + ' ' + url, function (t) {
          let extra = '';
          if (resultType === 'failing') {
            extra =
              ' limit ' + result.limitType + ' ' + result.friendlyLimit ||
              result.limit + EOL;
          }
          t.ok(
            resultType === 'failing' ? false : true,
            result.type + '.' + result.metric + ' ' + result.friendlyValue ||
              result.value + ' ' + extra + ' ' + url
          );
          t.end();
        });
      }
    }
  }
}
