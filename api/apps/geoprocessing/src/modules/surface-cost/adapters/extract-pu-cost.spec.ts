import { Test } from '@nestjs/testing';
import { PromiseType } from 'utility-types';
import {
  getGeoJson,
  getGeoJsonWithMissingCost,
  getGeometryMultiPolygon,
} from '../application/__mocks__/geojson';
import { ExtractPuCost } from './extract-pu-cost';

let sut: ExtractPuCost;
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
      /is supported/,
    );
  });
});

describe(`when given GeoJson has pu costs`, () => {
  it(`throws exception`, () => {
    expect(sut.extract(fixtures.geoFeaturesWithData())).toMatchInlineSnapshot(`
      Array [
        Object {
          "cost": 200,
          "planningUnitId": "uuid-1",
        },
        Object {
          "cost": 100,
          "planningUnitId": "uuid-2",
        },
      ]
    `);
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    providers: [ExtractPuCost],
  }).compile();

  return {
    getService: () => sandbox.get(ExtractPuCost),
    geoFeaturesWithoutCost: () => getGeoJsonWithMissingCost(),
    geoFeaturesWithData: () => getGeoJson(),
    simpleGeometry: () => getGeometryMultiPolygon(),
  };
};
