export const exists = (element: string | null | undefined): element is string =>
  Boolean(element);
