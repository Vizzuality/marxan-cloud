import { GeoJSON } from 'geojson';

export interface JobInput {
  scenarioId: string;
  include?: {
    pu?: string[];
    geo?: GeoJSON[];
  };
  exclude?: {
    pu?: string[];
    geo?: GeoJSON[];
  };
}
