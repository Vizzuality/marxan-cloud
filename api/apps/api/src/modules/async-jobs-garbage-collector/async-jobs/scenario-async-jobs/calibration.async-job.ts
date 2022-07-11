import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable } from '@nestjs/common';
import { ValuesType } from 'utility-types';
import { AsyncJob } from '../async-job';

type CalibrationApiEvents = ValuesType<
  Pick<
    typeof API_EVENT_KINDS,
    Extract<keyof typeof API_EVENT_KINDS, `scenario__calibration__${string}`>
  >
>;

@Injectable()
export class CalibrationAsyncJob extends AsyncJob {
  getAllAsyncJobStates(): CalibrationApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__calibration__submitted_v1_alpha1,
      API_EVENT_KINDS.scenario__calibration__finished_v1_alpha1,
      API_EVENT_KINDS.scenario__calibration__failed_v1_alpha1,
    ];
  }
  getEndAsynJobStates(): CalibrationApiEvents[] {
    return [
      API_EVENT_KINDS.scenario__calibration__finished_v1_alpha1,
      API_EVENT_KINDS.scenario__calibration__failed_v1_alpha1,
    ];
  }
  getFailedAsyncJobState(): CalibrationApiEvents {
    return API_EVENT_KINDS.scenario__calibration__failed_v1_alpha1;
  }
  getMaxHoursForAsyncJob(): number {
    return 8;
  }
}
