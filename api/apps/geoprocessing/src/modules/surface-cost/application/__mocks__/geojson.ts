import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { CostSurfaceShapefileRecord } from '../../ports/cost-surface-shapefile-record';

export const getGeoJson = (
  puids: number[],
): FeatureCollection<MultiPolygon | Polygon, CostSurfaceShapefileRecord> => ({
  type: 'FeatureCollection',
  features: puids.map((puid) => ({
    properties: {
      cost: 200,
      puid,
    },
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [],
    },
  })),
});

export const getGeoJsonWithMissingCost = (): FeatureCollection<
  MultiPolygon | Polygon,
  CostSurfaceShapefileRecord | Record<string, undefined>
> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
    },
    {
      properties: {},
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
  ],
});

export const getGeoJsonWithNegativeCost = (): FeatureCollection<
  MultiPolygon | Polygon,
  CostSurfaceShapefileRecord | Record<string, undefined>
> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        cost: 200,
        puid: 1,
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
    },
    {
      properties: {
        cost: -100,
        puid: 2,
      },
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
  ],
});

export const getGeometryMultiPolygon = (): MultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: [],
});
