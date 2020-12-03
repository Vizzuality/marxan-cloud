import type { FieldValidator, FieldState } from 'final-form';
import validate from 'validate.js';
import isObject from 'lodash/isObject';

export const composeValidators = (validations: Record<string, unknown>[]) => (
  value: unknown,
  allValues: Record<string, unknown>,
  meta?: FieldState<unknown>,
): FieldValidator<unknown>[] => {
  if (validations) {
    const errors = validations.map((validator: unknown) => {
      if (isObject(validator)) {
        return validate.single(value, validator);
      }

      if (typeof validator === 'function') {
        return validator(value, allValues, meta);
      }

      return undefined;
    }, []);

    if (errors.some((e) => !!e)) {
      return errors;
    }
  }

  return undefined;
};

export default {
  composeValidators,
};
