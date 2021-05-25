import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { PlanningUnitCost } from './planning-unit-cost';

export interface GeoSurfaceCostForScenario {
  scenarioId: string;
  geo: FeatureCollection<MultiPolygon | Polygon, PlanningUnitCost>;
}
