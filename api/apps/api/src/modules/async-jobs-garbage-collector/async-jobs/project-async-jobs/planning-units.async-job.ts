import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type PlanningUnitsApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `project__planningUnits__${string}`>
  >
>;

@Injectable()
export class PlanningUnitsAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): PlanningUnitsApiEvents[] {
    return [
      API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
      API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
      API_EVENT_KINDS.project__planningUnits__failed__v1__alpha,
    ];
  }
  getEndAsynJobStates(): PlanningUnitsApiEvents[] {
    return [
      API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
      API_EVENT_KINDS.project__planningUnits__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): PlanningUnitsApiEvents {
    return API_EVENT_KINDS.project__planningUnits__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
