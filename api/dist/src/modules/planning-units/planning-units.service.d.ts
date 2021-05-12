import { Queue } from 'bullmq';
import { CreatePlanningUnitsDTO } from './dto/create.planning-units.dto';
export declare class PlanningUnitsService {
    readonly queueName: string;
    private readonly logger;
    readonly planningUnitsQueue: Queue;
    private readonly queueEvents;
    constructor();
    create(creationOptions: CreatePlanningUnitsDTO): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
