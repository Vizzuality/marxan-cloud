import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type PlanningUnitsInclusionApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<
      keyof typeof API_EVENT_KINDS,
      `scenario__planningUnitsInclusion__${string}`
    >
  >
>;

@Injectable()
export class PlanningUnitsInclusionAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): PlanningUnitsInclusionApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1,
      API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1,
    ];
  }
  getEndAsynJobStates(): PlanningUnitsInclusionApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1,
    ];
  }
  getFailedAsyncJobState(): PlanningUnitsInclusionApiEvents {
    return API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
