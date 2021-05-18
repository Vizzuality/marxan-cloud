export enum CostSurfaceState {
  Submitted = 'submitted',
  ShapefileConverted = 'shapefile-converted',
  ShapefileConversionFailed = 'shapefile-conversion-failed',
  CostUpdateFailed = 'cost-update-failed',
  Finished = 'finished',
}

export abstract class CostSurfaceEventsPort {
  abstract event(
    scenarioId: string,
    state: CostSurfaceState,
    context?: Record<string, unknown> | Error,
  ): Promise<void>;
}
