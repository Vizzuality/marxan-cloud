export interface PUWithArea {
  id: string;
  area: number;
}
export abstract class GetAvailablePlanningUnits {
  abstract get(
    scenarioId: string,
  ): Promise<{
    ids: string[];
  }>;

  abstract getPUsWithArea(scenarioId: string): Promise<PUWithArea[]>;

  abstract getMaxPUAreaForScenario(scenarioId: string): Promise<number>;
}
