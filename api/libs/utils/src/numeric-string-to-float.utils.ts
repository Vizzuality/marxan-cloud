import { isNil } from 'lodash';

/**
 * Kind of like parseFloat(), but passing through undefined values, and handling
 * values that don't cast to a number.
 *
 * @debt It silently rounds to the maximum precision supported by Javascript any
 * input values that are numeric but beyond what can be represented in a
 * Javascript number (not BigInt). Infinity and -Infinity are also passed
 * through as corresponding Javascript Infinity numeric values.
 */
export function numericStringToFloat(
  value: string | undefined,
): number | undefined {
  // +(null) === 0, so we only cast if input is neither undefined nor null.
  if (!isNil(value)) {
    const floatValue = +value;
    if (!isNaN(floatValue)) {
      return floatValue;
    }
    throw new Error(`Invalid number: ${value}`);
  }
  return;
}
