import { Either, left, right } from 'fp-ts/lib/Either';

export const passwordEntropyValidation = (
  password: string,
): Either<string, void> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const entropyChecker = require('fast-password-entropy');
  const result = entropyChecker(password);
  const entropyThreshold = 80;
  if (result < entropyThreshold) {
    return left('Weak Password. Please use a stronger password.');
  }

  return right(void 0);
};
