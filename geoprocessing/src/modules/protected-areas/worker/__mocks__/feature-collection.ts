import { FeatureCollection } from 'geojson';

export const featCollectionWithPointsOnly: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      properties: {},
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [],
      },
    },
  ],
};

export const featCollectionWithPoint: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      properties: {},
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
    {
      properties: {},
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
    },
    {
      properties: {},
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [],
      },
    },
  ],
};
