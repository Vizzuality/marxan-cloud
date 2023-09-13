import { Left } from 'fp-ts/lib/Either';
import { jobSubmissionFailed } from '@marxan/artifact-cache';
import { Right } from 'fp-ts/Either';

export abstract class CostSurfaceCalculationPort {
  abstract forShapefile(
    projectId: string,
    costSurfaceId: string,
    file: Express.Multer.File,
  ): Promise<Left<typeof jobSubmissionFailed> | Right<true>>;
}
