import { Command } from '@nestjs-architects/typed-cqrs';
import { jobSubmissionFailed } from '@marxan/artifact-cache';
import { Either } from 'fp-ts/lib/Either';
import { FromProjectShapefileJobInput } from '@marxan/artifact-cache/surface-cost-job-input';

/**
 * @todo: Temporal substitute for UpdateCostSurface command, which works at scenario level. It should be
 *        removed and use there once the implementation is fully validated
 */
export class CreateProjectCostSurface extends Command<
  Either<typeof jobSubmissionFailed, true>
> {
  constructor(
    public readonly projectId: string,
    public readonly costSurfaceId: string,
    public readonly shapefile: FromProjectShapefileJobInput['shapefile'],
  ) {
    super();
  }
}
