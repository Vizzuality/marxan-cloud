import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { left, right } from 'fp-ts/lib/Either';
import { LinkCostSurfaceToScenarioJobInput } from '@marxan/artifact-cache/surface-cost-job-input';
import {
  LinkCostSurfaceToScenarioCommand,
  linkCostSurfaceToScenarioFailed,
  LinkCostSurfaceToScenarioResponse,
} from '@marxan-api/modules/cost-surface/application/scenario/link-cost-surface-to-scenario.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Repository } from 'typeorm';
import {
  ScenarioCostSurfaceEventsPort,
  ScenarioCostSurfaceState,
} from '@marxan-api/modules/cost-surface/ports/scenario/scenario-cost-surface-events.port';
import { scenarioCostSurfaceQueueToken } from '@marxan-api/modules/cost-surface/infra/scenario/scenario-cost-surface-queue.provider';

@CommandHandler(LinkCostSurfaceToScenarioCommand)
export class LinkCostSurfaceToScenarioHandler
  implements IInferredCommandHandler<LinkCostSurfaceToScenarioCommand>
{
  private readonly logger: Logger = new Logger(
    LinkCostSurfaceToScenarioHandler.name,
  );

  constructor(
    @Inject(scenarioCostSurfaceQueueToken)
    private readonly queue: Queue<LinkCostSurfaceToScenarioJobInput>,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    private readonly events: ScenarioCostSurfaceEventsPort,
  ) {}

  async execute({
    scenarioId,
    costSurfaceId,
    mode,
  }: LinkCostSurfaceToScenarioCommand): Promise<LinkCostSurfaceToScenarioResponse> {
    try {
      const scenario = await this.scenarioRepo.findOneOrFail({
        where: { id: scenarioId },
      });
      const originalCostSurfaceId = scenario.costSurfaceId;

      await this.queue.add(`link-cost-surface-for-scenario-${scenarioId}`, {
        type: 'LinkCostSurfaceToScenarioJobInput',
        scenarioId,
        costSurfaceId,
        originalCostSurfaceId,
        mode,
      });

      await this.scenarioRepo.update(scenarioId, { costSurfaceId });

      await this.events.event(
        scenarioId,
        ScenarioCostSurfaceState.LinkToScenarioSubmitted,
      );
    } catch (error) {
      await this.markAsFailed(scenarioId, error);
      return left(linkCostSurfaceToScenarioFailed);
    }

    return right(true);
  }

  private markAsFailed = async (scenarioId: string, error: unknown) => {
    this.logger.error(
      `Failed executing link-cost-surface-to-scenario command for scenario ${scenarioId}`,
      String(error),
    );
    await this.events.event(
      scenarioId,
      ScenarioCostSurfaceState.LinkToScenarioFailed,
      {
        error,
      },
    );
  };
}
