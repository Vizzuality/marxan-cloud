import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { jobSubmissionFailed } from '@marxan/scenario-cost-surface';

export const projectNotFound = Symbol('project not found');
export const nullPlanningUnitGridShape = Symbol(
  'null planning unit grid shape',
);

export type SetInitialCostSurfaceError =
  | typeof projectNotFound
  | typeof nullPlanningUnitGridShape
  | typeof jobSubmissionFailed;

export class SetInitialCostSurface extends Command<
  Either<SetInitialCostSurfaceError, true>
> {
  constructor(
    public readonly scenarioId: string,
    public readonly projectId: string,
  ) {
    super();
  }
}
