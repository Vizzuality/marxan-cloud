/**
 * ht: https://stackoverflow.com/a/69042224/550077
 */
export const hasProp = <K extends PropertyKey, T>(obj: T, prop: K): obj is T & Record<K, unknown> => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
  