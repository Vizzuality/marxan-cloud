import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type ScenarioCloneApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__clone__${string}`>
  >
>;

@Injectable()
export class ScenarioCloneAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): ScenarioCloneApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__clone__submitted__v1__alpha,
      API_EVENT_KINDS.scenario__clone__finished__v1__alpha,
      API_EVENT_KINDS.scenario__clone__failed__v1__alpha,
    ];
  }
  getEndAsynJobStates(): ScenarioCloneApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__clone__finished__v1__alpha,
      API_EVENT_KINDS.scenario__clone__failed__v1__alpha,
    ];
  }
  getFailedAsyncJobState(): ScenarioCloneApiEvents {
    return API_EVENT_KINDS.scenario__clone__failed__v1__alpha;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
