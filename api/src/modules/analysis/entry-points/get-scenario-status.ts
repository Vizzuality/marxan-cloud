import { ScenarioProcessingStatus } from './scenario-processing-status';

export abstract class GetScenarioStatus {
  abstract status(scenarioId: string): Promise<ScenarioProcessingStatus>;
}
