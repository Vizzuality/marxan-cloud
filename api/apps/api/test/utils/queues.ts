import { Inject, Injectable, Scope } from '@nestjs/common';
import { Job, JobsOptions, Queue, QueueBase } from 'bullmq';
import { v4 } from 'uuid';
import { assertDefined, FieldsOf } from '@marxan/utils';
import { QueueBuilder } from '@marxan-api/modules/queue/queue.builder';
import { QueueNameToken } from '@marxan-api/modules/queue/queue.tokens';
import { getRedisConfig } from '@marxan-api/utils/redisConfig.utils';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class FakeQueueBuilder implements FieldsOf<QueueBuilder> {
  queue?: FakeQueue;

  buildQueue(queueName: string): Queue {
    if (this.queue) {
      throw new Error('queue exists');
    }
    this.queue = new FakeQueue(queueName);
    return (this.queue as unknown) as Queue;
  }

  async onModuleDestroy(): Promise<void> {
    //
  }
}

class Key {}

@Injectable()
export class FakeQueue implements Partial<Queue> {
  // should be done with WeakRefs but the node version is 14.15.5, and it's available since 14.16
  private static instances: WeakMap<Key, FakeQueue> = new WeakMap();
  private static instanceKeys: Record<string, Key | undefined> = {};
  public jobs: Record<string, Job> = {};
  private readonly queueBase = new QueueBase(v4(), {
    ...getRedisConfig(),
  });

  constructor(
    @Inject(QueueNameToken)
    private readonly queueName: string,
  ) {
    const found = FakeQueue.findByName(queueName);
    if (!found) {
      this.keepThisInstance();
      return;
    }

    return found;
  }

  static getByName(queueName: string): FakeQueue {
    const instance = this.findByName(queueName);
    assertDefined(instance);
    return instance;
  }

  static findByName(queueName: string): FakeQueue | undefined {
    const key = this.instanceKeys[queueName];
    if (!key) return undefined;
    const instance = this.instances.get(key);
    if (!instance) return undefined;
    return instance;
  }

  disposeFakeJobs() {
    this.jobs = {};
  }

  add = jest.fn(
    async (name: string, data: any, opts: JobsOptions | undefined) => {
      const job: Job = new Job(this.queueBase, name, data, opts, opts?.jobId);
      if (!job.id) {
        job.id = v4();
      }
      this.jobs[name] = job;
      return job;
    },
  );

  close = jest.fn();
  disconnect = jest.fn();
  getJobs = jest.fn();
  remove = jest.fn();

  private keepThisInstance() {
    const newKey = new Key();
    FakeQueue.instanceKeys[this.queueName] = newKey;
    FakeQueue.instances.set(newKey, this);
  }
}
