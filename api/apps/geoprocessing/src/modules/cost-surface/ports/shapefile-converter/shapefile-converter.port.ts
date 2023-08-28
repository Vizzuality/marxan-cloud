import { FromShapefileJobInput } from '@marxan/artifact-cache';
import { GeoJSON } from 'geojson';

export abstract class ShapefileConverterPort {
  abstract convert(file: FromShapefileJobInput['shapefile']): Promise<GeoJSON>;
}
