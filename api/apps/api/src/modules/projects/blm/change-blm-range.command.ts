import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { ProjectBlm } from '@marxan-api/modules/blm';

export const forbidden = Symbol(`unauthorized access`);
export const invalidRange = Symbol(`invalid range`);
export const unknownError = Symbol(`unknown error`);
export const updateFailure = Symbol(`update failure`);
export const planningUnitAreaNotFound = Symbol(
  `could not query planning unit area for project`,
);

export type PlanningUnitAreaNotFoundError = typeof planningUnitAreaNotFound;

export type ChangeRangeErrors =
  | typeof invalidRange
  | typeof unknownError
  | typeof updateFailure
  | typeof forbidden
  | PlanningUnitAreaNotFoundError;

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
