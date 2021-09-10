import { Injectable } from '@nestjs/common';
import { ProjectWithScenarios } from '../job-status';
import { ProjectJobsStatusDto } from './project-jobs-status.dto';

@Injectable()
export class JobStatusSerializer {
  serialize(
    projectId: string,
    scenarioWithJobs: ProjectWithScenarios,
  ): ProjectJobsStatusDto {
    return {
      data: {
        type: 'project-jobs',
        id: projectId,
        attributes: {
          jobs: scenarioWithJobs.project.jobs,
          scenarios: scenarioWithJobs.scenarios.map((scenario) => ({
            id: scenario.scenarioId,
            jobs: scenario.jobs,
          })),
        },
      },
    };
  }
}
