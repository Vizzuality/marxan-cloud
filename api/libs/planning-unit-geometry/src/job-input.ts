import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export interface JobInput {
  scenarioId: string;
  include?: {
    // TODO remove uuid[] version - API handles this already
    pu?: string[];
    geo?: FeatureCollection<Polygon | MultiPolygon>[];
  };
  exclude?: {
    pu?: string[];
    geo?: FeatureCollection<Polygon | MultiPolygon>[];
  };
}
