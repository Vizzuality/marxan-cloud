import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type FeaturesWithPuIntersectionApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<
      keyof typeof API_EVENT_KINDS,
      `scenario__featuresWithPuIntersection__${string}`
    >
  >
>;

@Injectable()
export class FeaturesWithPuIntersectionAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): FeaturesWithPuIntersectionApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__featuresWithPuIntersection__submitted__v1__alpha1,
      API_EVENT_KINDS.scenario__featuresWithPuIntersection__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__featuresWithPuIntersection__finished__v1__alpha1,
    ];
  }
  getEndAsyncJobStates(): FeaturesWithPuIntersectionApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__featuresWithPuIntersection__failed__v1__alpha1,
      API_EVENT_KINDS.scenario__featuresWithPuIntersection__finished__v1__alpha1,
    ];
  }
  getFailedAsyncJobState(): FeaturesWithPuIntersectionApiEvents {
    return API_EVENT_KINDS.scenario__featuresWithPuIntersection__failed__v1__alpha1;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
