import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ScenarioImportApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__import__${string}`>
  >
>;

@Injectable()
export class ScenarioImportAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ScenarioImportApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__import__submitted__v1__alpha,
      API_EVENT_KINDS.scenario__import__finished__v1__alpha,
      API_EVENT_KINDS.scenario__import__failed__v1__alpha,
    ];
  }
  getEndAsyncJobStates(): ScenarioImportApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__import__finished__v1__alpha,
      API_EVENT_KINDS.scenario__import__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): ScenarioImportApiEvents {
    return API_EVENT_KINDS.scenario__import__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
