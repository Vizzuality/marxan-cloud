import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { ProjectBlm } from '@marxan-api/modules/blm';

export const invalidRange = Symbol(`invalid range`);
export const unknownError = Symbol(`unknown error`);
export const updateFailure = Symbol(`update failure`);
export const queryFailure = Symbol(`query failure`);

export type ChangeRangeErrors =
  | typeof invalidRange
  | typeof unknownError
  | typeof updateFailure
  | typeof queryFailure;

export class ChangeBlmRange extends Command<
  Either<ChangeRangeErrors, ProjectBlm>
> {
  constructor(
    public readonly projectId: string,
    public readonly range: [number, number],
  ) {
    super();
  }
}
