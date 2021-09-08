import { FeatureCollection, GeoJSON } from 'geojson';

export const isFeatureCollection = (geo: GeoJSON): geo is FeatureCollection => {
  return geo.type === 'FeatureCollection';
};
