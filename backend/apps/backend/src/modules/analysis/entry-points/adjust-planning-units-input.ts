import { GeoJSON } from 'geojson';

export interface AdjustPlanningUnitsInput {
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
