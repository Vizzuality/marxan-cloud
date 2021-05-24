import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { CostSurfaceJobInput } from '../../cost-surface-job-input';
import { ShapefileConverterPort } from '../../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class ShapefileConverterFake implements ShapefileConverterPort {
  mock: jest.Mock<Promise<GeoJSON>> = jest.fn();

  async convert(file: CostSurfaceJobInput['shapefile']): Promise<GeoJSON> {
    return this.mock(file);
  }
}
