import { jobSubmissionFailed } from '@marxan/artifact-cache';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/lib/Either';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from '../ports/cost-surface-events.port';
import { UpdateProjectCostSurface } from '@marxan-api/modules/cost-surface/application/update-project-cost-surface.command';
import { FromProjectShapefileJobInput } from '@marxan/artifact-cache/surface-cost-job-input';
import { projectCostSurfaceQueueToken } from '@marxan-api/modules/cost-surface/infra/project/project-cost-surface-queue.provider';

/**
 * @todo: The original typing lives under lib folder. Replace those with the new ones
 */

@CommandHandler(UpdateProjectCostSurface)
export class UpdateProjectCostSurfaceHandler
  implements IInferredCommandHandler<UpdateProjectCostSurface> {
  private readonly logger: Logger = new Logger(
    UpdateProjectCostSurfaceHandler.name,
  );

  constructor(
    @Inject(projectCostSurfaceQueueToken)
    private readonly queue: Queue<FromProjectShapefileJobInput>,
    private readonly events: CostSurfaceEventsPort,
  ) {}

  async execute({
    projectId,
    shapefile,
    costSurfaceId,
  }: UpdateProjectCostSurface): Promise<
    Either<typeof jobSubmissionFailed, true>
  > {
    try {
      await this.queue.add(`cost-surface-for-project-${projectId}`, {
        projectId,
        shapefile,
        costSurfaceId,
      });

      await this.events.event(projectId, CostSurfaceState.Submitted);
    } catch (error) {
      await this.markAsFailedSubmission(projectId, error);
      return left(jobSubmissionFailed);
    }

    return right(true);
  }

  private markAsFailedSubmission = async (
    projectId: string,
    error: unknown,
  ) => {
    this.logger.error(
      `Failed submitting cost-surface-for-${projectId} job`,
      String(error),
    );
    await this.events.event(projectId, CostSurfaceState.Submitted);
    await this.events.event(projectId, CostSurfaceState.CostUpdateFailed, {
      error,
    });
  };
}
