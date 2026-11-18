import timestamp from './time.js';
import { merge } from './objectPath.js';
import { randomUUID } from 'node:crypto';

export function messageMaker(source) {
  return {
    make(type, data, extras) {
      const stamp = timestamp().format();
      const uuid = randomUUID();

      return merge({ uuid, type, timestamp: stamp, source, data }, extras);
    }
  };
}
