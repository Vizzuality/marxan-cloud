import { TileRequest } from 'types/tileRequest';
import { Logger } from '@nestjs/common';
const logger = new Logger('Vector tile builder');
import { GetBaseQuery, GetTileQuery } from 'types/tileQuery';
import { defaultGetBaseQuery, defaultGetTileQuery } from './vector-tile.utils';

//define tile query input for the tile requested
export interface ITileQueryInput extends TileRequest {
  z: number;
  x: number;
  y: number;
  maxZoomLevel: number;
  table: string;
  geometry: string;
  extent: number;
  // attributes: string[];
  // query: string[];
  getBaseQuery?: GetBaseQuery;
  getTileQuery?: GetTileQuery;
}

// // creates the query for tile
export function createQueryForTile({
  z,
  x,
  y,
  maxZoomLevel,
  table,
  geometry,
  extent,
  // query,
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
      // attributes: attributesToSelect(attributes),
      // query,
    })})`,
  );

  let parentTable = 'base_query';

  queryParts.push(
    `tile AS (${getTileQuery({
      x,
      y,
      z,
      table: parentTable,
      geometry: 'the_geom',
      extent,
      // attributes: attributesToArray(attributes),
    })})`,
  );

  const sql: string = `${queryParts.join(
    ',\n',
  )}\nSELECT ST_AsMVT(tile, 'geom') AS mvt FROM tile`;

  // logger.debug(`Create query for tile: ${sql}`);

  return sql;
}
