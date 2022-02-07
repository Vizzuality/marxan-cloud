import { FromShapefileJobInput } from '@marxan/scenario-cost-surface';
import { GeoJSON } from 'geojson';

export abstract class ShapefileConverterPort {
  abstract convert(file: FromShapefileJobInput['shapefile']): Promise<GeoJSON>;
}
