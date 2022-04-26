import { format } from 'd3';

/**
 * @param blm blm value
 * @returns blm formatted value
 */
export const blmFormat = (blm: number): string => {
  if (blm < 1) {
    return format(',.3~f')(blm);
  }

  return format(',.0~f')(blm);
};

/**
 * @param bytes Bytes to convert to Megabytes.
 * @returns Megabytes
 */
export const bytesToMegabytes = (bytes: number): number => {
  return bytes / 1048576;
};
