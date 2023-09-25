import { jobSubmissionFailed } from '@marxan/artifact-cache';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/lib/Either';
import { CreateProjectCostSurface } from '@marxan-api/modules/cost-surface/application/project/create-project-cost-surface.command';
import { FromProjectShapefileJobInput } from '@marxan/artifact-cache/surface-cost-job-input';
import { projectCostSurfaceQueueToken } from '@marxan-api/modules/cost-surface/infra/project/project-cost-surface-queue.provider';
import {
  ProjectCostSurfaceEventsPort,
  ProjectCostSurfaceState,
} from '@marxan-api/modules/cost-surface/ports/project/project-cost-surface-events.port';

@CommandHandler(CreateProjectCostSurface)
export class CreateProjectCostSurfaceHandler
  implements IInferredCommandHandler<CreateProjectCostSurface> {
  private readonly logger: Logger = new Logger(
    CreateProjectCostSurfaceHandler.name,
  );

  constructor(
    @Inject(projectCostSurfaceQueueToken)
    private readonly queue: Queue<FromProjectShapefileJobInput>,
    private readonly events: ProjectCostSurfaceEventsPort,
  ) {}

  async execute({
    projectId,
    shapefile,
    costSurfaceId,
  }: CreateProjectCostSurface): Promise<
    Either<typeof jobSubmissionFailed, true>
  > {
    try {
      await this.queue.add(`cost-surface-for-project-${projectId}`, {
        projectId,
        shapefile,
        costSurfaceId,
      });

      await this.events.event(
        projectId,
        ProjectCostSurfaceState.ShapefileSubmitted,
      );
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
    await this.events.event(
      projectId,
      ProjectCostSurfaceState.ShapefileSubmitted,
    );
    await this.events.event(
      projectId,
      ProjectCostSurfaceState.CostUpdateFailed,
      {
        error,
      },
    );
  };
}
