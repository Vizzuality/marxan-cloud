import { API_EVENT_KINDS } from '@marxan/api-events';
import { JobType } from './jobs.enum';

/**
 * describes which of most-recent event should consider job as "done"
 */
export const jobStatusTargetEvents: Record<JobType, API_EVENT_KINDS[]> = {
  [JobType.CostSurface]: [
    API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
    API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
  ],
  [JobType.PlanningUnitInclusion]: [
    API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1,
    API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
  ],
};
