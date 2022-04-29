import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { PuExtractorPort } from '../../ports/pu-extractor/pu-extractor.port';
import { ShapefileRecord } from '../../ports/shapefile-record';

@Injectable()
export class PuExtractorFake implements PuExtractorPort {
  mock: jest.Mock<ShapefileRecord[]> = jest.fn();

  extract(geoJsonSurface: GeoJSON): ShapefileRecord[] {
    return this.mock(geoJsonSurface);
  }
}
