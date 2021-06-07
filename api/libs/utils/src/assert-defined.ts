export function assertDefined<T>(
  value: T | null | undefined,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Required assertion failed!');
  }
}
