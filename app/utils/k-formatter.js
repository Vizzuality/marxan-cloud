export const kFormatter = (num) => {
  return Math.abs(num) > 999 ? `${Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1))}K` : Math.sign(num) * Math.abs(num);
};
