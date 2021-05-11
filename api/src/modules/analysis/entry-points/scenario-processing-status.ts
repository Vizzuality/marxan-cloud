import { JobStatus } from '../../scenarios/scenario.api.entity';

export interface ScenarioProcessingStatus {
  id: string;
  status: JobStatus;
}
