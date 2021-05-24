import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { PuExtractorPort } from '../../ports/pu-extractor/pu-extractor.port';
import { PlanningUnitCost } from '../../ports/planning-unit-cost';

@Injectable()
export class PuExtractorFake implements PuExtractorPort {
  mock: jest.Mock<PlanningUnitCost[]> = jest.fn();

  extract(geoJsonSurface: GeoJSON): PlanningUnitCost[] {
    return this.mock(geoJsonSurface);
  }
}
