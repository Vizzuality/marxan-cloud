import { Injectable } from '@nestjs/common';

import { AsyncJob, JobStatus } from './async-job';
import { ArePuidsAllowedPort } from './are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';

import { AnalysisInput } from './analysis-input';

type Success = true;

@Injectable()
export class AnalysisService {
  constructor(
    private readonly puUuidValidator: ArePuidsAllowedPort,
    private readonly jobRequester: RequestJobPort,
    private readonly jobStatus: JobStatus,
  ) {}

  /**
   * we could use Either from fp-ts as a return value
   */
  async update(
    scenarioId: string,
    constraints: AnalysisInput,
  ): Promise<Success> {
    const targetPuIds = [
      ...(constraints.include?.pu ?? []),
      ...(constraints.exclude?.pu ?? []),
    ];
    if (targetPuIds.length > 0) {
      await this.puUuidValidator.validate(scenarioId, targetPuIds);
    }

    return true;
  }

  async getJobStatus(scenarioId: string): Promise<AsyncJob> {
    return this.getJobStatus(scenarioId);
  }

  private async executeCalculations(
    scenarioId: string,
    input: AnalysisInput,
  ): Promise<AsyncJob> {
    return this.jobRequester.queue({
      scenarioId,
      ...input,
    });
  }
}
