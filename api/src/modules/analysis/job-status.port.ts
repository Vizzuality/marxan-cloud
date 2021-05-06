import { AsyncJob } from './async-job';

export abstract class JobStatusPort {
  abstract scenarioStatus(scenarioId: string): Promise<AsyncJob>;
}
