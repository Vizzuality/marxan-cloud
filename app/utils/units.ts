import { format } from 'd3';

/**
 * @param bytes Bytes to convert to Megabytes.
 * @returns Megabytes
 */
export const bytesToMegabytes = (bytes: number): number => {
  return bytes / 1048576;
};

export const dotFormat = (num) => {
  const commaFormat = format(',');
  // The expression /,/g is a regular expression that matches all commas.
  return commaFormat(num).replace(/,/g, '.');
};
