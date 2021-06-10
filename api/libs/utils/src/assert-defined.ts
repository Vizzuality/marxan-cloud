import { isDefined } from './is-defined';

export function assertDefined<T>(
  value: T | null | undefined,
): asserts value is T {
  if (!isDefined(value)) throw new Error('assertion failed');
}
