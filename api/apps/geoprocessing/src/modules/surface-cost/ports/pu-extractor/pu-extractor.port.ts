import { GeoJSON } from 'geojson';
import { ShapefileRecord } from '../shapefile-record';

export abstract class PuExtractorPort {
  abstract extract(geoJsonSurface: GeoJSON): ShapefileRecord[];
}
