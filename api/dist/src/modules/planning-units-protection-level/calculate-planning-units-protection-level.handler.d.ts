import { ICommandHandler } from '@nestjs/cqrs';
import { CalculatePlanningUnitsProtectionLevelResult, CalculatePlanningUnitsProtectionLevel } from './calculate-planning-units-protection-level.command';
import { QueueService } from '../queue/queue.service';
export declare class CalculatePlanningUnitsProtectionLevelHandler implements ICommandHandler<CalculatePlanningUnitsProtectionLevel> {
    private readonly queueService;
    constructor(queueService: QueueService<CalculatePlanningUnitsProtectionLevel>);
    execute(command: CalculatePlanningUnitsProtectionLevel): Promise<CalculatePlanningUnitsProtectionLevelResult>;
    onCompleted({ jobId }: {
        jobId: string;
    }): void;
}
