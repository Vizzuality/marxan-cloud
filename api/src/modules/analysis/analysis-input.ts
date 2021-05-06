import { GeoJSON } from 'geojson';

export interface AnalysisInput {
  include?: {
    pu?: string[];
    geo?: GeoJSON[];
    shape?: GeoJSON[];
  };
  exclude?: {
    pu?: string[];
    geo?: GeoJSON[];
    shape?: GeoJSON[];
  };
}
