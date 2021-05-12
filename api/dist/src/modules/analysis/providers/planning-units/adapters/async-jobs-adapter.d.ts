import { RequestJobInput, RequestJobPort } from '../request-job.port';
import { AsyncJob } from '../../../async-job';
import { PlanningUnitsService } from '../../../../planning-units/planning-units.service';
export declare class AsyncJobsAdapter extends PlanningUnitsService implements RequestJobPort {
    constructor();
    queue(input: RequestJobInput): Promise<AsyncJob>;
}
