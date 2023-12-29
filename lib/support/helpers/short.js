export function short(text, number) {
  if (text.length > number) {
    return text.slice(0, number) + '...';
  }
  return text;
}
