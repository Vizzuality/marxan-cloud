import { AdjustPlanningUnitsInput } from '../../entry-points/adjust-planning-units-input';
import { AsyncJob } from '../../async-job';
export declare type RequestJobInput = AdjustPlanningUnitsInput & {
    scenarioId: string;
};
export declare abstract class RequestJobPort {
    abstract queue(input: RequestJobInput): Promise<AsyncJob>;
}
