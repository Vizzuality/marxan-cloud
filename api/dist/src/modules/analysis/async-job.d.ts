import { JobStatus } from '../scenarios/scenario.api.entity';
export interface AsyncJob {
    id: string;
    status: JobStatus;
}
