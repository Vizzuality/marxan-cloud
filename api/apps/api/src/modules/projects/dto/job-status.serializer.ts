import { Injectable } from '@nestjs/common';
import { Scenario } from '../job-status';
import { ProjectJobsStatusDto } from './project-jobs-status.dto';

@Injectable()
export class JobStatusSerializer {
  serialize(
    projectId: string,
    scenarioWithJobs: Scenario[],
  ): ProjectJobsStatusDto {
    return {
      data: {
        type: 'project-jobs',
        id: projectId,
        attributes: {
          scenarios: scenarioWithJobs.map((scenario) => ({
            id: scenario.scenarioId,
            jobs: scenario.jobs,
          })),
        },
      },
    };
  }
}
