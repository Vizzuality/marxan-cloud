import { Injectable } from '@nestjs/common';
import { GetScenarioStatus } from '../../entry-points/get-scenario-status';
import { ScenarioProcessingStatus } from '../../entry-points/scenario-processing-status';
import { JobStatus } from '../../../scenarios/scenario.api.entity';

@Injectable()
export class ScenarioStatusService implements GetScenarioStatus {
  async status(scenarioId: string): Promise<ScenarioProcessingStatus> {
    return {
      id: scenarioId,
      status: JobStatus.done,
    };
  }
}
