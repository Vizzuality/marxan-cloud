import { Injectable } from '@nestjs/common';
import { Job, JobsOptions, Queue, QueueBase } from 'bullmq';
import { v4 } from 'uuid';

@Injectable()
export class FakeQueue implements Partial<Queue> {
  public jobs: Record<string, Job> = {};
  private readonly queueBase = new QueueBase(v4());

  async add(
    name: string,
    data: any,
    opts: JobsOptions | undefined,
  ): Promise<Job<any, any, string>> {
    const job: Job = new Job(this.queueBase, name, data, opts);
    this.jobs[name] = job;
    return job;
  }

  async clear() {
    this.jobs = {};
  }

  close = jest.fn();
  disconnect = jest.fn();
}
