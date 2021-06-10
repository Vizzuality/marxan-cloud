import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export interface AdjustPlanningUnitsInput {
  include?: {
    pu?: string[];
    geo?: FeatureCollection<Polygon | MultiPolygon>[];
  };
  exclude?: {
    pu?: string[];
    geo?: FeatureCollection<Polygon | MultiPolygon>[];
  };
}
