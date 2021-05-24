import { Injectable } from '@nestjs/common';
import { GeoJSON, MultiPolygon, Polygon } from 'geojson';

@Injectable()
export class FakeGeometryExtractor {
  extractMock: jest.Mock<(MultiPolygon | Polygon)[]> = jest.fn();

  extract(geo: GeoJSON): (MultiPolygon | Polygon)[] {
    return this.extractMock(geo);
  }
}
