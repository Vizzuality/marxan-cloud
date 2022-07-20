import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ProjectExportApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `project__export__${string}`>
  >
>;

@Injectable()
export class ProjectExportAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ProjectExportApiEvents[] {
    return [
      API_EVENT_KINDS.project__export__submitted__v1__alpha,
      API_EVENT_KINDS.project__export__finished__v1__alpha,
      API_EVENT_KINDS.project__export__failed__v1__alpha,
    ];
  }
  getEndAsyncJobStates(): ProjectExportApiEvents[] {
    return [
      API_EVENT_KINDS.project__export__finished__v1__alpha,
      API_EVENT_KINDS.project__export__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): ProjectExportApiEvents {
    return API_EVENT_KINDS.project__export__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
