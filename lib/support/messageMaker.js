import dayjs from 'dayjs';
import merge from 'lodash.merge';
import { randomUUID } from 'node:crypto';

export function messageMaker(source) {
  return {
    make(type, data, extras) {
      const timestamp = dayjs().format();
      const uuid = randomUUID();

      return merge({ uuid, type, timestamp, source, data }, extras);
    }
  };
}
