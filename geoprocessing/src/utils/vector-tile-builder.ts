import { TileRequest } from 'src/types/tileRequest';
import { GetBaseQuery, GetTileQuery } from 'src/types/tileQuery';
import {
   attributesToSelect,
   attributesToArray,
   defaultGetBaseQuery,
   defaultGetTileQuery
} from './vector-tile.utils';

export interface ITileQueryInput extends TileRequest {
  // z: number;
  // x: number;
  // y: number;
  maxZoomLevel: number;
  table: string;
  geometry: string;
  sourceLayer: string;
  extent: number;
  attributes: string[];
  query: string[];
  getBaseQuery?: GetBaseQuery;
  getTileQuery?: GetTileQuery;
}

// creates the query for tile
export function createQueryForTile({
  z,
  x,
  y,
  maxZoomLevel,
  table,
  geometry,
  sourceLayer,
  extent,
  attributes,
  query,
  getBaseQuery = defaultGetBaseQuery,
  getTileQuery = defaultGetTileQuery,
}: ITileQueryInput): string {
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
    })})`
  );

  let parentTable = 'base_query';
  // to add here the simplicifation by zoom level or pyramiding?

  queryParts.push(
    `tile AS (${getTileQuery({
      x,
      y,
      z,
      table: parentTable,
      geometry: 'geom',
      extent,
      attributes: attributesToArray(attributes),
    })})`
  );

  const sql: string = `${queryParts.join(
    ',\n'
  )}\nSELECT ST_AsMVT(tile, '${sourceLayer}', ${extent}, 'geom') AS mvt FROM tile`;

  // console.log(sql);

  return sql;

}
