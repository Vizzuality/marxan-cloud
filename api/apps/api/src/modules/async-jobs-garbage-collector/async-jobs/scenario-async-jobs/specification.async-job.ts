import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type SpecificationApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__specification__${string}`>
  >
>;

@Injectable()
export class SpecificationAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): SpecificationApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__specification__submitted__v1__alpha1,
      API_EVENT_KINDS.scenario__specification__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__specification__finished__v1__alpha1,
    ];
  }
  getEndAsyncJobStates(): SpecificationApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__specification__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__specification__finished__v1__alpha1,
    ];
  }
  getFailedAsyncJobState(): SpecificationApiEvents {
    return API_EVENT_KINDS.scenario__specification__failed__v1__alpha1;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
