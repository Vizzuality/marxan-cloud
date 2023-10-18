export abstract class ScenarioCostSurfacePersistencePort {
  abstract linkScenarioToCostSurface(
    scenarioId: string,
    costSurface: string,
  ): Promise<void>;
}
