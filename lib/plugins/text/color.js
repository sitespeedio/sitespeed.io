const ansi = {
  reset: '\u001B[0m',
  bold: '\u001B[1m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  red: '\u001B[31m',
  blackBright: '\u001B[90m'
};

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replaceAll(/\u001B\[[0-9;]*[A-Za-z]/g, '');
}

export function colorise(str, clr) {
  if (!clr || !ansi[clr]) return str;
  return ansi[clr] + str + ansi.reset;
}

export function makeBold(str) {
  return ansi.bold + str + ansi.reset;
}

export function getStrippedLength(str) {
  return stripAnsi(str).length;
}

export function blackBright(str) {
  return colorise(str, 'blackBright');
}
