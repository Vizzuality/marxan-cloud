import {
  InitialCostJobInput,
  jobSubmissionFailed,
} from '@marxan/artifact-cache';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/lib/Either';
import { costSurfaceQueueToken } from '../infra/cost-surface-queue.provider';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from '../ports/cost-surface-events.port';
import {
  SetInitialCostSurface,
  SetInitialCostSurfaceError,
} from './set-initial-cost-surface.command';

/**
 * @deprecated: Should be removed once project level implementation is fully validated
 */
@CommandHandler(SetInitialCostSurface)
export class SetInitialCostSurfaceHandler
  implements IInferredCommandHandler<SetInitialCostSurface> {
  private readonly logger: Logger = new Logger(
    SetInitialCostSurfaceHandler.name,
  );

  constructor(
    @Inject(costSurfaceQueueToken)
    private readonly queue: Queue<InitialCostJobInput>,
    private readonly events: CostSurfaceEventsPort,
  ) {}

  async execute({
    scenarioId,
  }: SetInitialCostSurface): Promise<Either<SetInitialCostSurfaceError, true>> {
    try {
      await this.queue.add(`set-initial-cost-surface`, {
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
