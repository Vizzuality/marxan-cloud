import { Job } from 'bullmq';

export abstract class WorkerProcessor<Input, Output> {
  abstract process(job: Job<Input, Output>): Promise<Output>;
}
