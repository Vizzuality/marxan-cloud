import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type LegacyImportApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `project__legacy__${string}`>
  >
>;

@Injectable()
export class LegacyImportAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): LegacyImportApiEvents[] {
    return [
      API_EVENT_KINDS.project__legacy__import__canceled__v1__alpha,
      API_EVENT_KINDS.project__legacy__import__failed__v1__alpha,
      API_EVENT_KINDS.project__legacy__import__finished__v1__alpha,
      API_EVENT_KINDS.project__legacy__import__submitted__v1__alpha,
    ];
  }
  getEndAsynJobStates(): LegacyImportApiEvents[] {
    return [
      API_EVENT_KINDS.project__legacy__import__canceled__v1__alpha,
      API_EVENT_KINDS.project__legacy__import__failed__v1__alpha,
      API_EVENT_KINDS.project__legacy__import__finished__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): LegacyImportApiEvents {
    return API_EVENT_KINDS.project__legacy__import__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
