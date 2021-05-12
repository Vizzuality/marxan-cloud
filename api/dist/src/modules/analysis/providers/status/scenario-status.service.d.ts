import { GetScenarioStatus } from '../../entry-points/get-scenario-status';
import { ScenarioProcessingStatus } from '../../entry-points/scenario-processing-status';
export declare class ScenarioStatusService implements GetScenarioStatus {
    status(scenarioId: string): Promise<ScenarioProcessingStatus>;
}
