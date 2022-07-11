import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type CostSurfaceApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__costSurface__${string}`>
  >
>;

@Injectable()
export class CostSurfaceAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): CostSurfaceApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1,
      API_EVENT_KINDS.scenario__costSurface__shapeConverted__v1_alpha1,
      API_EVENT_KINDS.scenario__costSurface__shapeConversionFailed__v1_alpha1,
      API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
      API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
    ];
  }
  getEndAsynJobStates(): CostSurfaceApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
      API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
    ];
  }
  getFailedAsyncJobState(): CostSurfaceApiEvents {
    /*
    At the moment in the codebase, we are not using this two api events:
    API_EVENT_KINDS.scenario__costSurface__shapeConverted__v1_alpha1 
    API_EVENT_KINDS.scenario__costSurface__shapeConversionFailed__v1_alpha1
    In case we start using them, we migh have to do add new state to getEndAsynJobStates()
    and check the latestApitEvent when executing getFailedAsyncJobState()
    */
    return API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
