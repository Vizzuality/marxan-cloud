import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export interface CostSurfaceInput {
  geo: FeatureCollection<
    MultiPolygon | Polygon,
    {
      cost: number;
      planningUnitId: string;
    }
  >;
}
