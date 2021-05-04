// Should be implemented by BaseService of `scenarios_pu_data` entity
export abstract class ArePuidsAllowed {
  abstract validate(
    scenarioId: string,
    puIds: string[],
  ): Promise<{
    errors: unknown[];
  }>;
}
