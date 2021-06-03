import { GeoJSON, MultiPolygon } from 'geojson';

const MultipolygonGeometry: MultiPolygon = Object.freeze({
  type: 'MultiPolygon',
  coordinates: [[[[0, 0]]]],
});

export const validGeoJson = (): GeoJSON => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: MultipolygonGeometry,
    },
  ],
});

export const nonValidGeoJson = (): any => ({
  type: 'Topology',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: MultipolygonGeometry,
    },
  ],
});
