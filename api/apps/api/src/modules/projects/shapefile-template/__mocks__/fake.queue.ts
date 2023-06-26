import { Queue } from '../queue';

export class FakeQueue extends Queue {
  activeJobs: string[] = [];

  async isPending(scenarioId: string): Promise<boolean> {
    return this.activeJobs.includes(scenarioId);
  }

  startProcessing(scenarioId: string): void {
    this.activeJobs.push(scenarioId);
  }
}
