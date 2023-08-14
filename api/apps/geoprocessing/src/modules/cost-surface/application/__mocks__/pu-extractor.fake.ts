import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { PuExtractorPort } from '../../ports/pu-extractor/pu-extractor.port';
import { CostSurfaceShapefileRecord } from '../../ports/cost-surface-shapefile-record';

@Injectable()
export class PuExtractorFake implements PuExtractorPort {
  mock: jest.Mock<CostSurfaceShapefileRecord[]> = jest.fn();

  extract(geoJsonSurface: GeoJSON): CostSurfaceShapefileRecord[] {
    return this.mock(geoJsonSurface);
  }
}
