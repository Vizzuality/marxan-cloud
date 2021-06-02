import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { ShapefileService } from '../../shapefiles/shapefiles.service';

import { CostSurfaceJobInput } from '../cost-surface-job-input';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class ShapefileConverter implements ShapefileConverterPort {
  constructor(private readonly converter: ShapefileService) {}

  async convert(file: CostSurfaceJobInput['shapefile']): Promise<GeoJSON> {
    return (await this.converter.getGeoJson(file)).data;
  }
}
