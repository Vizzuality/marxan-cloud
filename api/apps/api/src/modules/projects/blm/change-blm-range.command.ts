import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';

export const invalidRange = Symbol(`invalid range`);
export const unknownError = Symbol(`unknown error`);

export type ChangeRangeErrors = typeof invalidRange | typeof unknownError;

export class ChangeBlmRange extends Command<Either<ChangeRangeErrors, true>> {
  constructor(
    public readonly projectId: string,
    public readonly range: [number, number],
  ) {
    super();
  }
}
