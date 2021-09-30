import { ViewColumn, ViewEntity } from 'typeorm';
import { JobType } from '@marxan-api/modules/projects/job-status/jobs.enum';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import { API_EVENT_KINDS, ProjectEvents } from '@marxan/api-events';
import { ValuesType } from 'utility-types';

@ViewEntity({
  expression: `
    SELECT DISTINCT ON (job_type, topic) job_type,
                                         api_events.topic AS project_id,
                                         api_events.kind,
                                         api_events.data,
                                         api_events.timestamp
    FROM api_events
           CROSS JOIN LATERAL SUBSTRING(
      api_events.kind
      FROM
      'project.#"[^.]*#"%' FOR '#'
      ) AS job_type
    ORDER BY job_type,
             api_events.topic,
             api_events.timestamp DESC
  `,
})
export class ProjectJobStatus {
  @ViewColumn({
    name: 'job_type',
  })
  jobType!: JobType;

  @ViewColumn()
  kind!: Extract<API_EVENT_KINDS, `project.${string}`>;

  get jobStatus(): JobStatus | undefined {
    return eventToJobStatusMapping[this.kind];
  }

  @ViewColumn({
    name: 'project_id',
  })
  projectId!: string;

  @ViewColumn()
  data!: ApiEvent['data'];

  @ViewColumn()
  timestamp!: Date;
}

const eventToJobStatusMapping: Record<ValuesType<ProjectEvents>, JobStatus> = {
  [API_EVENT_KINDS.project__grid__failed__v1__alpha]: JobStatus.failure,
  [API_EVENT_KINDS.project__grid__finished__v1__alpha]: JobStatus.done,
  [API_EVENT_KINDS.project__grid__submitted__v1__alpha]: JobStatus.running,
  [API_EVENT_KINDS.project__protectedAreas__failed__v1__alpha]:
    JobStatus.failure,
  [API_EVENT_KINDS.project__protectedAreas__finished__v1__alpha]:
    JobStatus.done,
  [API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha]:
    JobStatus.running,
};
