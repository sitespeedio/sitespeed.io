// Drop-in replacement for the slice of dayjs we actually use:
//   timestamp(value?), timestamp.utc(value?), .format(pattern?), .valueOf()
// Calendar arithmetic (add/diff/year/etc.) is intentionally not implemented —
// sitespeed.io doesn't use it. Format support is limited to the tokens we
// actually pass: YYYY, MM, DD, HH, mm, ss and Z.

const DEFAULT_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';

function pad(n) {
  return String(n).padStart(2, '0');
}

function parts(date, utc) {
  return utc
    ? {
        Y: date.getUTCFullYear(),
        M: date.getUTCMonth() + 1,
        D: date.getUTCDate(),
        h: date.getUTCHours(),
        m: date.getUTCMinutes(),
        s: date.getUTCSeconds()
      }
    : {
        Y: date.getFullYear(),
        M: date.getMonth() + 1,
        D: date.getDate(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
      };
}

function zoneString(date, utc) {
  // The Z token always expands to the actual offset; that's what dayjs does
  // for user-supplied patterns. The literal 'Z' suffix that
  // dayjs.utc().format() produces is handled in Timestamp.format() instead.
  const offset = utc ? 0 : -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return `${sign}${pad(Math.trunc(abs / 60))}:${pad(abs % 60)}`;
}

function formatWith(pattern, date, utc) {
  const p = parts(date, utc);
  const zone = zoneString(date, utc);
  return pattern
    .replaceAll('YYYY', String(p.Y))
    .replaceAll('MM', pad(p.M))
    .replaceAll('DD', pad(p.D))
    .replaceAll('HH', pad(p.h))
    .replaceAll('mm', pad(p.m))
    .replaceAll('ss', pad(p.s))
    .replaceAll('Z', zone);
}

class Timestamp {
  constructor(value, utc) {
    this.date = value === undefined ? new Date() : new Date(value);
    this.utcMode = utc;
  }

  format(pattern) {
    if (pattern === undefined) {
      // dayjs's default no-arg format. In UTC mode it ends with a literal 'Z'
      // (rather than '+00:00') — mirror that quirk explicitly.
      if (this.utcMode) {
        return formatWith('YYYY-MM-DDTHH:mm:ss', this.date, this.utcMode) + 'Z';
      }
      return formatWith(DEFAULT_FORMAT, this.date, this.utcMode);
    }
    return formatWith(pattern, this.date, this.utcMode);
  }

  valueOf() {
    return this.date.valueOf();
  }
}

export default function timestamp(value) {
  return new Timestamp(value, false);
}

timestamp.utc = function utcTimestamp(value) {
  return new Timestamp(value, true);
};
