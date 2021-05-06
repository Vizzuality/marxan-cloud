import { AnalysisInput } from './analysis-input';
import { AsyncJob } from './async-job';

export type RequestJobInput = AnalysisInput & { scenarioId: string };

export abstract class RequestJobPort {
  abstract queue(input: RequestJobInput): Promise<AsyncJob>;
}
