import { GeoJSON } from 'geojson';
import { PlanningUnitCost } from '../planning-unit-cost';

export abstract class PuExtractorPort {
  abstract extract(geoJsonSurface: GeoJSON): PlanningUnitCost[];
}
