import { GeometryExtractor } from './geometry-extractor';
import { Test } from '@nestjs/testing';

import {
  featCollectionWithPoint,
  featCollectionWithPointsOnly,
} from '../../../utils/__mocks__/feature-collection';
import { multiPolygon, polygon } from '../../../utils/__mocks__/polygons';

let sut: GeometryExtractor;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [GeometryExtractor],
  }).compile();
  sut = sandbox.get(GeometryExtractor);
});

it(`extracts geometries from FeatureCollection`, () => {
  expect(sut.extract(featCollectionWithPoint).length).toEqual(2);
});

test.each([
  [polygon, 1],
  [multiPolygon, 1],
])(`extracts geometries from simple geometries`, (geo, count) => {
  expect(sut.extract(geo).length).toEqual(count);
});

it(`returns empty array if no supported geometry is found`, () => {
  expect(sut.extract(featCollectionWithPointsOnly).length).toEqual(0);
});
