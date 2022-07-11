import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type GridApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `project__grid__${string}`>
  >
>;

@Injectable()
export class GridAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): GridApiEvents[] {
    return [
      API_EVENT_KINDS.project__grid__submitted__v1__alpha,
      API_EVENT_KINDS.project__grid__finished__v1__alpha,
      API_EVENT_KINDS.project__grid__failed__v1__alpha,
    ];
  }
  getEndAsynJobStates(): GridApiEvents[] {
    return [
      API_EVENT_KINDS.project__grid__finished__v1__alpha,
      API_EVENT_KINDS.project__grid__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): GridApiEvents {
    return API_EVENT_KINDS.project__grid__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
