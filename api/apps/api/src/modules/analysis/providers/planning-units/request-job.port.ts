import { JobInput } from '@marxan-jobs/planning-unit-geometry';

export abstract class RequestJobPort {
  abstract queue(input: JobInput): Promise<void>;
}
