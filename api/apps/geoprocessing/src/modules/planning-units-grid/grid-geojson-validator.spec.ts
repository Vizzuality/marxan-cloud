import { Test } from '@nestjs/testing';
import { FeatureCollection, Geometry } from 'geojson';
import {
  GridGeoJsonValidator,
  invalidFeatureGeometry,
  notFeatureCollections,
} from './grid-geojson-validator';

let sut: GridGeoJsonValidator;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [GridGeoJsonValidator],
  }).compile();
  sut = sandbox.get(GridGeoJsonValidator);
});

test(`providing non feature collection`, () => {
  expect(sut.validate(nonFeatureCollection())).toEqual({
    _tag: 'Left',
    left: notFeatureCollections,
  });
});

test(`providing non polygons within collection`, () => {
  expect(sut.validate(featureCollectionWithLine())).toEqual({
    _tag: 'Left',
    left: invalidFeatureGeometry,
  });
});

test(`providing feature collection with polygons only`, () => {
  expect(sut.validate(featureCollectionWithPolygons())).toEqual({
    _tag: 'Right',
    right: featureCollectionWithPolygons(),
  });
});

const nonFeatureCollection = (): Geometry => ({
  type: 'Point',
  bbox: [0, 0, 0, 0, 0, 0],
  coordinates: [],
});

const featureCollectionWithLine = (): FeatureCollection => ({
  type: 'FeatureCollection',
  bbox: [0, 0, 0, 0, 0, 0],
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
    },
  ],
});

const featureCollectionWithPolygons = (): FeatureCollection => ({
  type: 'FeatureCollection',
  bbox: [0, 0, 0, 0, 0, 0],
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
  ],
});
