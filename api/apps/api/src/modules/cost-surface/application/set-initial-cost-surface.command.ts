import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { jobSubmissionFailed } from '@marxan/artifact-cache';

export type SetInitialCostSurfaceError = typeof jobSubmissionFailed;

/**
 * @deprecated: Should be removed once project level implementation is fully validated
 */
export class SetInitialCostSurface extends Command<
  Either<SetInitialCostSurfaceError, true>
> {
  constructor(public readonly scenarioId: string) {
    super();
  }
}
