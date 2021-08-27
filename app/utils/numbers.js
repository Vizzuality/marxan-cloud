import { format } from 'd3';

export const percentageFormatter = (value) => {
  const fixedValue = value.toFixed(2);
  return format('.2%')(parseFloat(fixedValue) / 100);
};
