import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ProjectCloneApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `project__clone__${string}`>
  >
>;

@Injectable()
export class ProjectCloneAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ProjectCloneApiEvents[] {
    return [
      API_EVENT_KINDS.project__clone__submitted__v1__alpha,
      API_EVENT_KINDS.project__clone__finished__v1__alpha,
      API_EVENT_KINDS.project__clone__failed__v1__alpha,
    ];
  }
  getEndAsyncJobStates(): ProjectCloneApiEvents[] {
    return [
      API_EVENT_KINDS.project__clone__finished__v1__alpha,
      API_EVENT_KINDS.project__clone__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): ProjectCloneApiEvents {
    return API_EVENT_KINDS.project__clone__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
