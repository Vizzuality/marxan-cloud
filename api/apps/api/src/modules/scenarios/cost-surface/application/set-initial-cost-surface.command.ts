import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { jobSubmissionFailed } from '@marxan/scenario-cost-surface';

export type SetInitialCostSurfaceError = typeof jobSubmissionFailed;

export class SetInitialCostSurface extends Command<
  Either<SetInitialCostSurfaceError, true>
> {
  constructor(public readonly scenarioId: string) {
    super();
  }
}
