import { Test } from '@nestjs/testing';
import { PromiseType } from 'utility-types';
import {
  getGeoJson,
  getGeoJsonWithMissingCost,
  getGeoJsonWithNegativeCost,
  getGeometryMultiPolygon,
} from '../application/__mocks__/geojson';
import { PuCostExtractor } from './pu-cost-extractor';

let sut: PuCostExtractor;
let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
  sut = fixtures.getService();
});

describe(`when features miss cost`, () => {
  it(`throws exception`, () => {
    expect(() => sut.extract(fixtures.geoFeaturesWithoutCost())).toThrow(
      /missing cost/,
    );
  });
});

describe(`when given GeoJson isn't a FeatureCollection`, () => {
  it(`throws exception`, () => {
    expect(() => sut.extract(fixtures.simpleGeometry())).toThrow(
      /Only FeatureCollection is supported/,
    );
  });
});

describe(`when given GeoJson has pu costs`, () => {
  it(`resolves them`, () => {
    expect(sut.extract(fixtures.geoFeaturesWithData())).toMatchInlineSnapshot(`
      Array [
        Object {
          "cost": 200,
          "puid": 1,
        },
        Object {
          "cost": 200,
          "puid": 2,
        },
      ]
    `);
  });
});

describe(`when given GeoJson has some negative pu costs`, () => {
  it(`throws exception`, () => {
    expect(() => sut.extract(fixtures.geoFeaturesWithNegativeCost())).toThrow(
      /invalid cost/,
    );
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    providers: [PuCostExtractor],
  }).compile();

  return {
    getService: () => sandbox.get(PuCostExtractor),
    geoFeaturesWithoutCost: () => getGeoJsonWithMissingCost(),
    geoFeaturesWithData: () => getGeoJson([1, 2]),
    geoFeaturesWithNegativeCost: () => getGeoJsonWithNegativeCost(),
    simpleGeometry: () => getGeometryMultiPolygon(),
  };
};
