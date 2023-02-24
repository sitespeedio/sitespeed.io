export function plural(number, text) {
  if (number === 0 || number > 1) {
    text += 's';
  }
  return '' + number + ' ' + text;
}
