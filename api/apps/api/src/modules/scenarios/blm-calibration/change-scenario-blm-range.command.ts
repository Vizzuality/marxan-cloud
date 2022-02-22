import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { Blm } from '@marxan-api/modules/blm';
import { GetScenarioFailure } from '@marxan-api/modules/blm/values/blm-repos';

export const invalidRange = Symbol(`invalid range`);
export const unknownError = Symbol(`unknown error`);
export const updateFailure = Symbol(`update failure`);
export const planningUnitAreaNotFound = Symbol(
  `could not query planning unit area for project`,
);

export type PlanningUnitAreaNotFoundError = typeof planningUnitAreaNotFound;

export type ChangeScenarioRangeErrors =
  | typeof invalidRange
  | typeof unknownError
  | typeof updateFailure
  | GetScenarioFailure;

export class ChangeScenarioBlmRange extends Command<
  Either<ChangeScenarioRangeErrors, Blm>
> {
  constructor(
    public readonly scenarioId: string,
    public readonly range: [number, number],
  ) {
    super();
  }
}
