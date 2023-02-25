export function decimals(decimals) {
  let number = Number(decimals).toFixed(3);
  return number === '0.000' ? 0 : number;
}
