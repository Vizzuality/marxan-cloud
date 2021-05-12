import { ScenarioProcessingStatus } from './scenario-processing-status';
export declare abstract class GetScenarioStatus {
    abstract status(scenarioId: string): Promise<ScenarioProcessingStatus>;
}
