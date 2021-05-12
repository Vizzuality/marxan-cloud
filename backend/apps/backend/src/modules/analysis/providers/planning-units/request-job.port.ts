import { AdjustPlanningUnitsInput } from '../../entry-points/adjust-planning-units-input';
import { AsyncJob } from '../../async-job';

export type RequestJobInput = AdjustPlanningUnitsInput & { scenarioId: string };

export abstract class RequestJobPort {
  abstract queue(input: RequestJobInput): Promise<AsyncJob>;
}
