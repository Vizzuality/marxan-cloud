import { CostSurfaceShapefileRecord } from '../../ports/cost-surface-shapefile-record';

export const getCostByPlanningUnit = (
  planningUnitsPuids: number[],
  expectedCost?: number,
): CostSurfaceShapefileRecord[] =>
  planningUnitsPuids.map((pu) => ({
    cost: expectedCost ?? 200,
    puid: pu,
  }));
