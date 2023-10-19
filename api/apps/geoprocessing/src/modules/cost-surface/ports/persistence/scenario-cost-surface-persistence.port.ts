import { LinkCostSurfaceToScenarioMode } from '@marxan/artifact-cache/surface-cost-job-input';

export abstract class ScenarioCostSurfacePersistencePort {
  abstract linkScenarioToCostSurface(
    scenarioId: string,
    costSurface: string,
    mode: LinkCostSurfaceToScenarioMode,
  ): Promise<void>;
}
