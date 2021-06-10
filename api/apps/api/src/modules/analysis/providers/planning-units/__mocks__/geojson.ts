import { FeatureCollection, MultiPolygon } from 'geojson';

const MultipolygonGeometry: MultiPolygon = Object.freeze({
  type: 'MultiPolygon',
  coordinates: [[[[0, 0]]]],
});

export const validGeoJson = (): FeatureCollection<MultiPolygon> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: MultipolygonGeometry,
    },
  ],
});
