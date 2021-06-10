import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JobStatus as Status } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { assertDefined } from '@marxan/utils';
import { ScenarioJobStatus } from './job-status.view.api.entity';
import { JobType } from './jobs.enum';

export { Status };

export interface Job {
  kind: JobType;
  status: Status;
}

export interface Scenario {
  scenarioId: string;
  jobs: Job[];
}

@Injectable()
export class JobStatusService {
  constructor(
    @InjectRepository(ScenarioJobStatus)
    private readonly statusRepository: Repository<ScenarioJobStatus>,
  ) {}

  async getJobStatusFor(projectId: string): Promise<Scenario[]> {
    const statuses = await this.statusRepository.find({
      projectId,
    });
    type ScenarioId = string;
    const groupedStatuses: Record<ScenarioId, Scenario> = {};
    for (const status of statuses) {
      groupedStatuses[status.scenarioId] ??= {
        scenarioId: status.scenarioId,
        jobs: [],
      };
      const jobStatus = status.jobStatus;
      assertDefined(jobStatus);
      groupedStatuses[status.scenarioId].jobs.push({
        kind: status.jobType,
        status: jobStatus,
      });
    }

    return Object.values(groupedStatuses);
  }
}
