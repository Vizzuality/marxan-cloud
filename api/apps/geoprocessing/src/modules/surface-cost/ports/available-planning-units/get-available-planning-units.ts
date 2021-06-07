export abstract class GetAvailablePlanningUnits {
  abstract get(
    scenarioId: string,
  ): Promise<{
    ids: string[];
  }>;
}
