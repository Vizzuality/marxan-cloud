import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  CalculatePlanningUnitsProtectionLevelResult,
  CalculatePlanningUnitsProtectionLevel,
} from './calculate-planning-units-protection-level.command';
import { QueueService } from '../queue/queue.service';
import { ApiEventsService } from '../api-events/api-events.service';

@CommandHandler(CalculatePlanningUnitsProtectionLevel)
export class CalculatePlanningUnitsProtectionLevelHandler
  implements ICommandHandler<CalculatePlanningUnitsProtectionLevel> {
  constructor(
    private readonly queueService: QueueService<CalculatePlanningUnitsProtectionLevel>,
    private readonly events: ApiEventsService,
  ) {
    this.queueService.registerEventHandler('completed', this.onCompleted);
  }

  async execute(
    command: CalculatePlanningUnitsProtectionLevel,
  ): Promise<CalculatePlanningUnitsProtectionLevelResult> {
    await this.events.create({
      kind:
        API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__submitted__v1__alpha1,
      topic: command.scenarioId,
    });
    await this.queueService.queue.add(
      `calculate-planning-units-protection-level-${command.scenarioId}`,
      command,
      {},
    );

    return true;
  }

  onCompleted({ jobId }: { jobId: string }) {
    console.log(`--- job ${jobId} completed`);
  }
}
