import { ViewColumn, ViewEntity } from 'typeorm';
import { JobType } from '@marxan-api/modules/projects/job-status/jobs.enum';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';

@ViewEntity({
  expression: `
    SELECT
      DISTINCT ON ("jobType", topic) "jobType",
      api_events.topic AS "scenarioId",
      projects.id AS "projectId",
      api_events.kind
    FROM
      api_events
      INNER JOIN scenarios ON api_events.topic = scenarios.id
      INNER JOIN projects ON projects.id = scenarios.project_id
      CROSS JOIN LATERAL SUBSTRING(
        api_events.kind
        FROM
          'scenario.#"[^.]*#"%' FOR '#'
      ) AS "jobType"
    ORDER BY
      "jobType",
      api_events.topic,
      api_events.timestamp DESC;
  `,
})
export class ScenarioJobStatus {
  @ViewColumn()
  jobType!: JobType;

  @ViewColumn()
  kind!: API_EVENT_KINDS;

  get jobStatus(): JobStatus | undefined {
    // I didn't use CASE ... THEN in the SQL as I wanted to enforce the compiler check on the mapping
    return eventToJobStatusMapping[this.kind];
  }

  @ViewColumn()
  scenarioId!: string;

  @ViewColumn()
  projectId!: string;
}

const eventToJobStatusMapping: Record<
  API_EVENT_KINDS,
  JobStatus | undefined
> = {
  [API_EVENT_KINDS.project__protectedAreas__failed__v1__alpha]: undefined,
  [API_EVENT_KINDS.project__protectedAreas__finished__v1__alpha]: undefined,
  [API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha]: undefined,
  [API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1]: JobStatus.done,
  [API_EVENT_KINDS.scenario__costSurface__shapeConversionFailed__v1_alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__costSurface__shapeConverted__v1_alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1]:
    JobStatus.failure,
  [API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1]:
    JobStatus.done,
  [API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1]:
    JobStatus.running,
  [API_EVENT_KINDS.user__accountActivationFailed__v1alpha1]: undefined,
  [API_EVENT_KINDS.user__accountActivationSucceeded__v1alpha1]: undefined,
  [API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1]: undefined,
  [API_EVENT_KINDS.user__passwordResetFailed__v1alpha1]: undefined,
  [API_EVENT_KINDS.user__passwordResetSucceeded__v1alpha1]: undefined,
  [API_EVENT_KINDS.user__passwordResetTokenGenerated__v1alpha1]: undefined,
  [API_EVENT_KINDS.user__signedUp__v1alpha1]: undefined,
};
