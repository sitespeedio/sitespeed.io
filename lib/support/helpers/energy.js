// Browsertime gives the energy in Wh, which is a very small number for one page
export function milliwattHours(wattHours) {
  return `${(Number(wattHours) * 1000).toFixed(1)} mWh`;
}
