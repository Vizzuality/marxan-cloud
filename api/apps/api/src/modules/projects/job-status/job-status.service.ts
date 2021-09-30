import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Required } from 'utility-types';
import { JobStatus as Status } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { assertDefined, isDefined } from '@marxan/utils';
import { ScenarioJobStatus } from './job-status.view.api.entity';
import { JobType } from './jobs.enum';
import { ProjectJobStatus } from '@marxan-api/modules/projects/job-status/project-status.view.api.entity';

export { Status };

export interface Job {
  kind: JobType;
  status: Status;
  isoDate?: string;
}

export type ProgressJob = Job & {
  data: {
    fractionalProgress: number;
  };
};

export type AnyJob = Job | ProgressJob;

export interface Scenario {
  scenarioId: string;
  jobs: AnyJob[];
}

export interface Project {
  jobs: AnyJob[];
}

export interface ProjectWithScenarios {
  scenarios: Scenario[];
  project: Project;
}

@Injectable()
export class JobStatusService {
  constructor(
    @InjectRepository(ScenarioJobStatus)
    private readonly statusRepository: Repository<ScenarioJobStatus>,
    @InjectRepository(ProjectJobStatus)
    private readonly projectStatusRepository: Repository<ProjectJobStatus>,
  ) {}

  async getJobStatusFor(projectId: string): Promise<ProjectWithScenarios> {
    const statuses = await this.statusRepository.find({
      projectId,
    });
    const projectJobs = await this.projectStatusRepository.find({
      where: {
        projectId,
      },
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
        data: status.publicEventData,
        isoDate: new Date(status.timestamp).toISOString(),
      });
    }

    return {
      scenarios: Object.values(groupedStatuses),
      project: {
        jobs: projectJobs.filter(this.#hasJobStatus).map((job) => ({
          kind: job.jobType,
          status: job.jobStatus!, // guard, or even types, do not play well
          // with getters
          data: job.data,
          isoDate: new Date(job.timestamp).toISOString(),
        })),
      },
    };
  }

  #hasJobStatus = (
    job: ProjectJobStatus,
  ): job is Required<ProjectJobStatus, 'jobStatus'> => isDefined(job.jobStatus);
}
