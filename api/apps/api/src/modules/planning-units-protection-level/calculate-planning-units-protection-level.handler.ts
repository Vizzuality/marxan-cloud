import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CalculatePlanningUnitsProtectionLevelResult,
  CalculatePlanningUnitsProtectionLevel,
} from './calculate-planning-units-protection-level.command';
import { QueueService } from '../queue/queue.service';
import { ApiEventsService } from '../api-events/api-events.service';
import { Logger } from '@nestjs/common';

@CommandHandler(CalculatePlanningUnitsProtectionLevel)
export class CalculatePlanningUnitsProtectionLevelHandler
  implements ICommandHandler<CalculatePlanningUnitsProtectionLevel>
{
  constructor(
    private readonly queueService: QueueService<CalculatePlanningUnitsProtectionLevel>,
    private readonly events: ApiEventsService,
  ) {
    this.queueService.registerEventHandler('completed', this.onCompleted);
  }

  async execute(
    command: CalculatePlanningUnitsProtectionLevel,
  ): Promise<CalculatePlanningUnitsProtectionLevelResult> {
    await this.queueService.queue.add(
      `calculate-planning-units-protection-level-${command.scenarioId}`,
      command,
      {},
    );

    return true;
  }

  onCompleted({ jobId }: { jobId: string }) {
    Logger.log(`--- job ${jobId} completed`);
  }
}
