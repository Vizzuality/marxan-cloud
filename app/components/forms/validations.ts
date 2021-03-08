import type { FieldValidator, FieldState } from 'final-form';
import validate from 'validate.js';

export const composeValidators = (validations: any[]) => (
  value: unknown,
  allValues: Record<string, unknown>,
  meta?: FieldState<unknown>,
): FieldValidator<unknown>[] => {
  if (validations) {
    const errors = validations.map((validator: unknown) => {
      if (typeof validator === 'function') {
        return validator(value, allValues, meta);
      }

      if (validator) {
        return validate.single(value, validator);
      }

      return undefined;
    }, []);

    if (errors.some((e) => !!e)) {
      return errors;
    }
  }

  return undefined;
};

export const booleanValidator = (value) => {
  if (!value) return 'Error';

  return undefined;
};

export const arrayValidator = (value) => {
  if (!value || !value.length) return 'Error';

  return undefined;
};

export default {
  composeValidators,
};
