import { GeoSurfaceCostForScenario } from '../geo-surface-cost-for-scenario';
import { PlanningUnitCost } from '../planning-unit-cost';

export abstract class PuExtractorPort {
  abstract extract(
    geoJsonSurface: GeoSurfaceCostForScenario['geo'],
  ): PlanningUnitCost[];
}
