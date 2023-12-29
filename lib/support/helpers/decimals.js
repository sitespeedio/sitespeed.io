export function decimals(decimals) {
  const num = Number(decimals);

  // Check if the number is an integer (no decimals)
  if (Number.isInteger(num)) {
    return num;
  }

  // If the number is less than 1, use three decimals
  if (num < 1) {
    return Number(num.toFixed(3));
  }

  // If the number is greater than 1 and has decimals, use one decimal
  return Number(num.toFixed(1));
}
