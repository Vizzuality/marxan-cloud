export enum ProjectCostSurfaceState {
  ShapefileSubmitted = 'shapefile-submitted',
  ShapefileConverted = 'shapefile-converted',
  ShapefileConversionFailed = 'shapefile-conversion-failed',
  CostUpdateFailed = 'cost-update-failed',
  CostUpdateFinished = 'finished',
}

export abstract class ProjectCostSurfaceEventsPort {
  abstract event(
    scenarioId: string,
    state: ProjectCostSurfaceState,
    context?: Record<string, unknown> | Error,
  ): Promise<void>;
}
