import { ShapefileRecord } from '../../ports/shapefile-record';

export const getCostByPlanningUnit = (
  planningUnitsPuids: number[],
  expectedCost?: number,
): ShapefileRecord[] =>
  planningUnitsPuids.map((pu) => ({
    cost: expectedCost ?? 200,
    puid: pu,
  }));
