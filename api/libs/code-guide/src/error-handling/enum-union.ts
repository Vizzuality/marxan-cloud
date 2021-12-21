enum ErrorOne {
  Some,
  Another,
}

enum ErrorTwo {
  Unknown,
}

type PossibleErrors = ErrorOne | ErrorTwo;

const issue: PossibleErrors = ErrorOne.Some;

switch (issue) {
  // @ts-ignore
  case ErrorTwo.Unknown:
    break;
  case ErrorOne.Some:
    break;
}
