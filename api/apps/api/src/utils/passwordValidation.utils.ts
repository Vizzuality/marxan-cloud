import { Either, left, right } from 'fp-ts/lib/Either';
import entropyChecker from 'fast-password-entropy';

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
