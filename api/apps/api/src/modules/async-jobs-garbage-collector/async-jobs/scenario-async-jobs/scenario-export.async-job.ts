import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ScenarioExportApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__export__${string}`>
  >
>;

@Injectable()
export class ScenarioExportAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ScenarioExportApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__export__submitted__v1__alpha,
      API_EVENT_KINDS.scenario__export__finished__v1__alpha,
      API_EVENT_KINDS.scenario__export__failed__v1__alpha,
    ];
  }
  getEndAsyncJobStates(): ScenarioExportApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__export__finished__v1__alpha,
      API_EVENT_KINDS.scenario__export__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): ScenarioExportApiEvents {
    return API_EVENT_KINDS.scenario__export__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
