import { InitialCostJobInput } from '@marxan/scenario-cost-surface';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.api.entity';
import { surfaceCostQueueToken } from '../infra/surface-cost-queue.provider';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from '../ports/cost-surface-events.port';
import { SetInitialCostSurface } from './set-initial-cost-surface.command';

@CommandHandler(SetInitialCostSurface)
export class SetInitialCostSurfaceHandler
  implements IInferredCommandHandler<SetInitialCostSurface> {
  constructor(
    @Inject(surfaceCostQueueToken)
    private readonly queue: Queue<InitialCostJobInput>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly events: CostSurfaceEventsPort,
    private logger: Logger,
  ) {
    this.logger.setContext(SetInitialCostSurfaceHandler.name);
  }

  async execute({
    scenarioId,
    projectId,
  }: SetInitialCostSurface): Promise<void> {
    const project = await this.projectRepo.findOne(projectId);

    if (!project || !project.planningUnitGridShape) return;

    const { planningUnitGridShape } = project;

    await this.queue
      .add(`set-initial-cost-surface`, {
        puGridShape: planningUnitGridShape,
        scenarioId,
      })
      .then(() => this.events.event(scenarioId, CostSurfaceState.Submitted))
      .catch(async (error) => {
        await this.markAsFailedSubmission(scenarioId, error);
        throw error;
      });
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
