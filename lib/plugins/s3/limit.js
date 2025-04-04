import { getLogger } from '@sitespeed.io/log';
const log = getLogger('sitespeedio.plugin.s3');

export async function runWithConcurrencyLimit(tasks, limit) {
  async function worker() {
    while (tasks.length > 0) {
      const task = tasks.shift();
      try {
        await task();
      } catch (error) {
        log.error('Could not finish upload task', error);
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
}
