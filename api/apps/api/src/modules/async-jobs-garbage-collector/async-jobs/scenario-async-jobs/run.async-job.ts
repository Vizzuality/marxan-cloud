import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type RunApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__run__${string}`>
  >
>;

@Injectable()
export class RunAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): RunApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__run__submitted__v1__alpha1,
      API_EVENT_KINDS.scenario__run__progress__v1__alpha1,
      API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__run__outputSaved__v1__alpha1,
      API_EVENT_KINDS.scenario__run__outputSaveFailed__v1__alpha1,
      API_EVENT_KINDS.scenario__run__finished__v1__alpha1,
    ];
  }
  getEndAsynJobStates(): RunApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__run__outputSaved__v1__alpha1,
      API_EVENT_KINDS.scenario__run__outputSaveFailed__v1__alpha1,
    ];
  }
  getFailedAsyncJobState(stuckState: API_EVENT_KINDS): RunApiEvents {
    /*
     * In case it gets stuck before saving output (it has finished but has not saved),
     * mark save output as failed
     */
    if (stuckState === API_EVENT_KINDS.scenario__run__finished__v1__alpha1)
      return API_EVENT_KINDS.scenario__run__outputSaveFailed__v1__alpha1;

    return API_EVENT_KINDS.scenario__run__failed__v1__alpha1;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
