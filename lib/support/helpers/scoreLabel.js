export function scoreLabel(value = 0) {
  if (value > 90) {
    return 'ok';
  } else if (value > 80) {
    return 'warning';
  }
  return 'error';
}
