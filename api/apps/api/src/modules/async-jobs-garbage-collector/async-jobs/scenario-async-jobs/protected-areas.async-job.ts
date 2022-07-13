import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ProtectedAreasApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__protectedAreas__${string}`>
  >
>;

@Injectable()
export class ProtectedAreasAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ProtectedAreasApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__protectedAreas__submitted__v1__alpha,
      API_EVENT_KINDS.scenario__protectedAreas__finished__v1__alpha,
      API_EVENT_KINDS.scenario__protectedAreas__failed__v1__alpha,
    ];
  }
  getEndAsyncJobStates(): ProtectedAreasApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__protectedAreas__finished__v1__alpha,
      API_EVENT_KINDS.scenario__protectedAreas__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): ProtectedAreasApiEvents {
    return API_EVENT_KINDS.scenario__protectedAreas__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
