import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

export interface JobDataWithScenarioId {
  scenarioId: string;
}

@Injectable()
export class ScenarioJobService {
  constructor() {}

  async getScenarioJob<T extends JobDataWithScenarioId>(
    queue: Queue<T>,
    scenarioId: string,
    jobTypes: string[],
  ): Promise<Job<T> | undefined> {
    const jobs: Job<T>[] = await queue.getJobs(jobTypes);
    return jobs.find((job) => job.data.scenarioId === scenarioId);
  }

  async cancelScenarioJob<T extends JobDataWithScenarioId>(
    scenarioJob: Job<T>,
  ): Promise<void> {
    const { scenarioId } = scenarioJob.data;
    const jobIsActive = await scenarioJob.isActive();

    if (jobIsActive)
      await scenarioJob.updateProgress({
        canceled: true,
        scenarioId,
      });

    const jobIsWaiting = await scenarioJob.isWaiting();

    if (jobIsWaiting) await scenarioJob.remove();
  }
}
