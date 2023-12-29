import dayjs from 'dayjs';
import merge from 'lodash.merge';
import { v4 as makeUuid } from 'uuid';

export function messageMaker(source) {
  return {
    make(type, data, extras) {
      const timestamp = dayjs().format();
      const uuid = makeUuid();

      return merge({ uuid, type, timestamp, source, data }, extras);
    }
  };
}
