import { Either, left, right } from 'fp-ts/lib/Either';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const entropyChecker = require('fast-password-entropy');

export const isStringEntropyHigherThan = (
  entropyThreshold: number,
  password: string,
): Either<string, void> => {
  const result = entropyChecker(password);
  if (result < entropyThreshold) {
    return left('Weak Password. Please use a stronger password.');
  }

  return right(void 0);
};
