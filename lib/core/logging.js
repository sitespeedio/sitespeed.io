import { configureLog } from '@sitespeed.io/log';

export function configure(options = {}) {
  configureLog({
    level: options.logLevel ?? undefined,
    verbose: options.verbose ?? 0,
    silent: options.silent ?? false
  });
}
