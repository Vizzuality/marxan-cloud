import { MultiPolygon } from 'geojson';

export interface AnalysisInput {
  include?: {
    pu?: string[];
    geo?: MultiPolygon;
    shape?: MultiPolygon;
  };
  exclude?: {
    pu?: string[];
    geo?: MultiPolygon;
    shape?: MultiPolygon;
  };
}
