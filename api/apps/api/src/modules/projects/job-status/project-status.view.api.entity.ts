import { ViewColumn, ViewEntity } from 'typeorm';
import { JobType } from '@marxan-api/modules/projects/job-status/jobs.enum';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import { API_EVENT_KINDS, ProjectEvents } from '@marxan/api-events';
import { ValuesType } from 'utility-types';
import { ApiEventJobStatus } from './api-event-job-status.enum';

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

  get jobStatus(): ApiEventJobStatus | undefined {
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

const eventToJobStatusMapping: Record<
  ValuesType<ProjectEvents>,
  ApiEventJobStatus
> = {
  [API_EVENT_KINDS.project__grid__failed__v1__alpha]: ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__grid__finished__v1__alpha]: ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__grid__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__planningUnits__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__planningUnits__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__export__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__export__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__export__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__export__piece__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__export__piece__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__export__piece__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__import__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__import__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__import__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__import__piece__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__import__piece__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__import__piece__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__clone__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__clone__finished__v1__alpha]: ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__clone__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__legacy__import__canceled__v1__alpha]:
    ApiEventJobStatus.canceled,
  [API_EVENT_KINDS.project__legacy__import__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__legacy__import__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__legacy__import__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__legacy__import__piece__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__legacy__import__piece__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__legacy__import__piece__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__protectedAreas__finished__v1__alpha]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__protectedAreas__failed__v1__alpha]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__costSurface_shapefile_submitted__v1alpha1]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__costSurface_shapefile_finished__v1alpha1]:
    ApiEventJobStatus.done,
  [API_EVENT_KINDS.project__costSurface_shapefile_failed__v1alpha1]:
    ApiEventJobStatus.failure,
  [API_EVENT_KINDS.project__costSurface_shapeConverted__v1alpha1]:
    ApiEventJobStatus.running,
  [API_EVENT_KINDS.project__costSurface_shapeConversionFailed__v1alpha1]:
    ApiEventJobStatus.failure,
};
