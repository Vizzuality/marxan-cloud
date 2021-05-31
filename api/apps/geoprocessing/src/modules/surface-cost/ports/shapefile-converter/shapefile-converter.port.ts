import { GeoJSON } from 'geojson';
import { CostSurfaceJobInput } from '../../cost-surface-job-input';

export abstract class ShapefileConverterPort {
  abstract convert(file: CostSurfaceJobInput['shapefile']): Promise<GeoJSON>;
}
