import { Injectable } from '@nestjs/common';

import { AsyncJob } from './async-job';
import { ArePuidsAllowedPort } from './are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';

import { AnalysisInput } from './analysis-input';
import { JobStatusPort } from './job-status.port';

type Success = true;

@Injectable()
export class AnalysisService {
  constructor(
    private readonly puUuidValidator: ArePuidsAllowedPort,
    private readonly jobRequester: RequestJobPort,
    private readonly jobStatus: JobStatusPort,
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
      const { errors } = await this.puUuidValidator.validate(
        scenarioId,
        targetPuIds,
      );
      if (errors.length > 0) {
        throw new Error('Given PU ids are not reachable in this context.');
      }
    }

    await this.jobRequester.queue({
      scenarioId,
      ...constraints,
    });

    return true;
  }

  async getJobStatus(scenarioId: string): Promise<AsyncJob> {
    return this.jobStatus.scenarioStatus(scenarioId);
  }
}
