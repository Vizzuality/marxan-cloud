/**
 * Seconds + nanosecond to milliseconds conversion.
 */
export const tookMs = (hrtime: [number, number]): number => {
  const NS_PER_SEC = 1e9;
  return (hrtime[0] * NS_PER_SEC + hrtime[1]) / 1e6;
};
