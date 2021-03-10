import { TileRequest } from 'types/tileRequest';
import { GetBaseQuery } from 'types/tileQueryBase';

export interface TileQueryInput extends TileRequest {
  maxZoomLevel: number;
  table: string;
  geometry: string;
  // sourceLayer: string;
  // radius: number;
  // extent: number;
  // bufferSize: number;
  attributes: string[];
  query: string[];
  // debug: boolean;
  // zoomToDistance?: ZoomToDistance;
  // getBaseQuery?: GetBaseQuery;
  // getTileQuery?: GetTileQuery;
  // getLevelClusterQuery?: GetLevelClusterQuery;
  // getLevelGroupQuery?: GetLevelGroupQuery;
}

export function createQueryForTile({
  z,
  x,
  y,
  maxZoomLevel,
  table,
  geometry,
  // sourceLayer,
  // radius,
  // extent,
  // bufferSize,
  attributes,
  query,
}: // debug,
// zoomToDistance = defaultZoomToDistance,
// getBaseQuery = defaultGetBaseQuery,
// getTileQuery = defaultGetTileQuery,
// getLevelClusterQuery = defaultGetLevelClusterQuery,
// getLevelGroupQuery = defaultGetLevelGroupQuery,
TileQueryInput): string {
  const queryParts: string[] = [];
  queryParts.push(
    `WITH base_query AS (${getBaseQuery({
      x,
      y,
      z,
      table,
      geometry,
      maxZoomLevel,
      attributes: attributesToSelect(attributes),
      query,
    })})`,
  );
}
