import { GeoJSON } from 'geojson';
import { CostSurfaceShapefileRecord } from '../cost-surface-shapefile-record';

export abstract class PuExtractorPort {
  abstract extract(geoJsonSurface: GeoJSON): CostSurfaceShapefileRecord[];
}
