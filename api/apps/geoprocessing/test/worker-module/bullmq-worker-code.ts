import { Job } from 'bullmq';
import { WorkerProcessor } from '../../src/modules/worker';

export class ExampleWorkerJobProcessor extends WorkerProcessor<
  Record<string, unknown>,
  { inputCopy: Record<string, unknown> }
> {
  async process(job: Job) {
    return {
      inputCopy: job.data,
    };
  }
}
