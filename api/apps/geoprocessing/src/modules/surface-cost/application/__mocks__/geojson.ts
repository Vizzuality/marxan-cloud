import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getGeoJson = (): FeatureCollection<
  MultiPolygon | Polygon,
  PlanningUnitCost
> => ({
  type: 'FeatureCollection',
  features: [
    {
      properties: {
        cost: 200,
        planningUnitId: 'uuid-1',
      },
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
    },
    {
      properties: {
        cost: 100,
        planningUnitId: 'uuid-2',
      },
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
  ],
});

export const getGeoJsonWithMissingCost = (): FeatureCollection<
  MultiPolygon | Polygon,
  PlanningUnitCost | Record<string, undefined>
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
