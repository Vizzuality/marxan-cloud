import { Command } from '@nestjs-architects/typed-cqrs';
import {
  FromShapefileJobInput,
  jobSubmissionFailed,
} from '@marxan/scenario-cost-surface';
import { Either } from 'fp-ts/lib/Either';

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
