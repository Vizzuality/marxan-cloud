import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CalculatePlanningUnitsProtectionLevelResult,
  CalculatePlanningUnitsProtectionLevel,
} from './calculate-planning-units-protection-level.command';
import { QueueService } from '../queue/queue.service';

@CommandHandler(CalculatePlanningUnitsProtectionLevel)
export class CalculatePlanningUnitsProtectionLevelHandler
  implements ICommandHandler<CalculatePlanningUnitsProtectionLevel> {
  constructor(
    private readonly queueService: QueueService<CalculatePlanningUnitsProtectionLevel>,
  ) {
    this.queueService.registerEventHandler('completed', this.onCompleted);
  }

  async execute(
    command: CalculatePlanningUnitsProtectionLevel,
  ): Promise<CalculatePlanningUnitsProtectionLevelResult> {
    await this.queueService.queue.add(this.queueService.name, command, {});

    return true;
  }

  onCompleted({ jobId }: { jobId: string }) {
    console.log(`--- job ${jobId} completed`);
  }
}
