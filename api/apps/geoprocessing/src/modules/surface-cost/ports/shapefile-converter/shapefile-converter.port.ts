import { FromShapefileJobInput } from '@marxan/scenarios-planning-unit';
import { GeoJSON } from 'geojson';

export abstract class ShapefileConverterPort {
  abstract convert(file: FromShapefileJobInput['shapefile']): Promise<GeoJSON>;
}
