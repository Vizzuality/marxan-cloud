import { ViewColumn, ViewEntity } from 'typeorm';
import { JobType } from '@marxan-api/modules/projects/job-status/jobs.enum';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import {
  ApiEvent,
  KnownEventsData,
} from '@marxan-api/modules/api-events/api-event.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ScenarioEvents } from '@marxan/api-events/api-event-kinds.enum';
import { ValuesType } from 'utility-types';

@ViewEntity({
  expression: `
    SELECT
      DISTINCT ON (job_type, topic) job_type,
      api_events.topic AS scenario_id,
      projects.id AS project_id,
      api_events.kind,
      api_events.data
    FROM
      api_events
      INNER JOIN scenarios ON api_events.topic = scenarios.id
      INNER JOIN projects ON projects.id = scenarios.project_id
      CROSS JOIN LATERAL SUBSTRING(
        api_events.kind
        FROM
          'scenario.#"[^.]*#"%' FOR '#'
      ) AS job_type
    ORDER BY
      job_type,
      api_events.topic,
      api_events.timestamp DESC;
  `,
})
export class ScenarioJobStatus {
  @ViewColumn({
    name: 'job_type',
  })
  jobType!: JobType;

  @ViewColumn()
  kind!: Extract<API_EVENT_KINDS, `scenario.${string}`>;

  get jobStatus(): JobStatus | undefined {
    // I didn't use CASE ... THEN in the SQL as I wanted to enforce the compiler check on the mapping
    return eventToJobStatusMapping[this.kind];
  }

  @ViewColumn({
    name: 'scenario_id',
  })
  scenarioId!: string;

  @ViewColumn({
    name: 'project_id',
  })
  projectId!: string;

  @ViewColumn()
  data!: ApiEvent['data'];

  get publicEventData(): { fractionalProgress: number } | undefined {
    const data: KnownEventsData | undefined = this.data;
    if (
      data &&
      'kind' in data &&
      data.kind === API_EVENT_KINDS.scenario__run__progress__v1__alpha1
    ) {
      return {
        fractionalProgress: data.fractionalProgress,
      };
    }
  }
}

const eventToJobStatusMapping: Record<ValuesType<ScenarioEvents>, JobStatus> = {
  [API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1]: JobStatus.done,
  [API_EVENT_KINDS.scenario__costSurface__shapeConversionFailed__v1_alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__costSurface__shapeConverted__v1_alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__run__progress__v1__alpha1]: JobStatus.running,
  [API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1]:
    JobStatus.done,
  [API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__run__submitted__v1__alpha1]: JobStatus.running,
  [API_EVENT_KINDS.scenario__run__finished__v1__alpha1]: JobStatus.running,
  [API_EVENT_KINDS.scenario__run__failed__v1__alpha1]: JobStatus.failure,
  [API_EVENT_KINDS.scenario__run__outputSaveFailed__v1__alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__run__outputSaved__v1__alpha1]: JobStatus.done,
  [API_EVENT_KINDS.scenario__geofeatureCopy__submitted__v1__alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__geofeatureCopy__failed__v1__alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__geofeatureCopy__finished__v1__alpha1]:
    JobStatus.done,
  [API_EVENT_KINDS.scenario__geofeatureSplit__submitted__v1__alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__geofeatureSplit__failed__v1__alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__geofeatureSplit__finished__v1__alpha1]:
    JobStatus.done,
  [API_EVENT_KINDS.scenario__geofeatureStratification__submitted__v1__alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__geofeatureStratification__failed__v1__alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__geofeatureStratification__finished__v1__alpha1]:
    JobStatus.done,
  [API_EVENT_KINDS.scenario__specification__submitted__v1__alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__specification__failed__v1__alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__specification__finished__v1__alpha1]:
    JobStatus.done,
};
