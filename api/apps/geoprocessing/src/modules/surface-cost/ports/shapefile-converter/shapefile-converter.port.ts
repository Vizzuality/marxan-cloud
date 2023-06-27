import { FromShapefileJobInput } from '@marxan/project-template-file';
import { GeoJSON } from 'geojson';

export abstract class ShapefileConverterPort {
  abstract convert(file: FromShapefileJobInput['shapefile']): Promise<GeoJSON>;
}
