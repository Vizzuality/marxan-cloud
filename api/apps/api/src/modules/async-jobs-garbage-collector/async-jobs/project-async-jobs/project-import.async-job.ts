import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ProjectImportApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `project__import__${string}`>
  >
>;

@Injectable()
export class ProjectImportAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ProjectImportApiEvents[] {
    return [
      API_EVENT_KINDS.project__import__submitted__v1__alpha,
      API_EVENT_KINDS.project__import__finished__v1__alpha,
      API_EVENT_KINDS.project__import__failed__v1__alpha,
    ];
  }
  getEndAsynJobStates(): ProjectImportApiEvents[] {
    return [
      API_EVENT_KINDS.project__import__finished__v1__alpha,
      API_EVENT_KINDS.project__import__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): ProjectImportApiEvents {
    return API_EVENT_KINDS.project__import__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
