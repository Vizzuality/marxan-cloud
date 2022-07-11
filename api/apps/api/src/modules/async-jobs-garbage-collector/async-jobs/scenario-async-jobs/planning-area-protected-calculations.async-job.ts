import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ProtectedAreasApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<
      keyof typeof API_EVENT_KINDS,
      `scenario__planningAreaProtectedCalculation__${string}`
    >
  >
>;

@Injectable()
export class PlanningAreaProtectedCalculationAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ProtectedAreasApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__submitted__v1__alpha1,
      API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__finished__v1__alpha1,
      API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__failed__v1__alpha1,
    ];
  }
  getEndAsynJobStates(): ProtectedAreasApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__finished__v1__alpha1,
      API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__failed__v1__alpha1,
    ];
  }
  getFailedAsyncJobState(): ProtectedAreasApiEvents {
    return API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__failed__v1__alpha1;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
