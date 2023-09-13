import { Command } from '@nestjs-architects/typed-cqrs';
import {
  FromShapefileJobInput,
  jobSubmissionFailed,
} from '@marxan/artifact-cache';
import { Either } from 'fp-ts/lib/Either';

/**
 * @deprecated: Should be removed once project level implementation is fully validated
 */
export class UpdateCostSurface extends Command<
  Either<typeof jobSubmissionFailed, true>
> {
  constructor(
    public readonly scenarioId: string,
    public readonly shapefile: FromShapefileJobInput['shapefile'],
  ) {
    super();
  }
}
