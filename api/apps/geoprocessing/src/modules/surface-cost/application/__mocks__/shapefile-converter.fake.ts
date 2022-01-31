import { FromShapefileJobInput } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { ShapefileConverterPort } from '../../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class ShapefileConverterFake implements ShapefileConverterPort {
  mock: jest.Mock<Promise<GeoJSON>> = jest.fn();

  async convert(file: FromShapefileJobInput['shapefile']): Promise<GeoJSON> {
    return this.mock(file);
  }
}
