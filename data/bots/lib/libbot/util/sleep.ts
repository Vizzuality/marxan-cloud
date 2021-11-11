export const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
}