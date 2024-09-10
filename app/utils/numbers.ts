export function toFixedWithoutZeros(num: number, decimalPlaces = 2): number {
  return Number(num.toFixed(decimalPlaces).replace(/\.?0+$/, ''));
}
