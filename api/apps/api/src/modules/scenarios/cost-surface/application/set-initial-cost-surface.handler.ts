import {
  InitialCostJobInput,
  jobSubmissionFailed,
} from '@marxan/scenario-cost-surface';
import { Inject, ConsoleLogger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { right, left, Either } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.api.entity';
import { surfaceCostQueueToken } from '../infra/surface-cost-queue.provider';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from '../ports/cost-surface-events.port';
import {
  nullPlanningUnitGridShape,
  projectNotFound,
  SetInitialCostSurface,
  SetInitialCostSurfaceError,
} from './set-initial-cost-surface.command';

@CommandHandler(SetInitialCostSurface)
export class SetInitialCostSurfaceHandler
  implements IInferredCommandHandler<SetInitialCostSurface>
{
  constructor(
    @Inject(surfaceCostQueueToken)
    private readonly queue: Queue<InitialCostJobInput>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly events: CostSurfaceEventsPort,
    private logger: ConsoleLogger,
  ) {
    this.logger.setContext(SetInitialCostSurfaceHandler.name);
  }

  async execute({
    scenarioId,
    projectId,
  }: SetInitialCostSurface): Promise<Either<SetInitialCostSurfaceError, true>> {
    const project = await this.projectRepo.findOne(projectId);

    if (!project) return left(projectNotFound);
    const { planningUnitGridShape } = project;

    if (!planningUnitGridShape) return left(nullPlanningUnitGridShape);

    try {
      await this.queue.add(`set-initial-cost-surface`, {
        puGridShape: planningUnitGridShape,
        scenarioId,
      });
      await this.events.event(scenarioId, CostSurfaceState.Submitted);
    } catch (error) {
      await this.markAsFailedSubmission(scenarioId, error);
      return left(jobSubmissionFailed);
    }

    return right(true);
  }

  private markAsFailedSubmission = async (
    scenarioId: string,
    error: unknown,
  ) => {
    this.logger.error(
      `Failed submitting set-initial-cost-surface job for scenario with ID ${scenarioId}`,
      String(error),
    );
    await this.events.event(scenarioId, CostSurfaceState.Submitted);
    await this.events.event(scenarioId, CostSurfaceState.CostUpdateFailed, {
      error,
    });
  };
}
