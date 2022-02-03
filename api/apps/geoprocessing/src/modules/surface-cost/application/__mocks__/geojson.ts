import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getGeoJson = (
  planningUnitsIds: string[],
): FeatureCollection<MultiPolygon | Polygon, PlanningUnitCost> => ({
  type: 'FeatureCollection',
  features: planningUnitsIds.map((id, index) => ({
    properties: {
      cost: 200,
      puid: index,
      puUuid: id,
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

export const getGeoJsonWithNegativeCost = (): FeatureCollection<
  MultiPolygon | Polygon,
  PlanningUnitCost | Record<string, undefined>
> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        cost: 200,
        puid: 'uuid-1',
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
    },
    {
      properties: {
        cost: -100,
        puid: 'uuid-2',
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
