// to-do: work on cache later
import { Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as zlib from 'zlib';

export interface Tile {
  res: number;
  data?: Buffer;
  status?: string;
}

/**
 * @description The specification of the tile request
 */
export interface TileRequest {
  /**
   * @description The zoom level ranging from 0 - 20
   */
  z: number;

  /**
   * @description The tile x offset on Mercator Projection
   */
  x: number;

  /**
   * @description The tile y offset on Mercator Projection
   */
  y: number;
}

/**
 * @description Input interface for the tile query builder
 */
export interface ITileQuery {
  x: number;
  y: number;
  z: number;
  table: string;
  geometry: string;
  extent: number;
  buffer: number;
  // attributes: string;
}

/**
 * @description The tile query builder callback definition
 */
export type GetTileQuery = (input: ITileQuery) => string;

/**
 * @description Input interface for the base query builder
 */
export interface IBaseQueryInput {
  x: number;
  y: number;
  z: number;
  table: string;
  geometry: string;
  maxZoomLevel: number;
  buffer: number;
  extent: number;
  // attributes: string;
  // query: string[];
}

/**
 * @description The base query builder callback definition
 */
export type GetBaseQuery = (input: IBaseQueryInput) => string;

/**
 * @description This function define tile query input for the tile requested
 */
export interface ITileQueryInput extends TileRequest {
  z: number;
  x: number;
  y: number;
  maxZoomLevel: number;
  table: string;
  geometry: string;
  extent: number;
  buffer: number;
  // attributes: string[];
  // query: string[];
  getBaseQuery?: GetBaseQuery;
}

const logger = new Logger('Vector tile service');
@Injectable()
export class TileService {
  // todo . add constructor

  /**
   * @description The default base query builder
   */
  defaultGetBaseQuery: GetBaseQuery = ({
    x,
    y,
    z,
    table,
    geometry,
    extent,
    buffer,
  }: // maxZoomLevel,
  // attributes,
  // query,
  IBaseQueryInput) => `
  SELECT
    gid_0, gid_1, gid_2,
    ST_AsMVTGeom(
      -- Geometry from table
      ST_Transform(${geometry}, 3857),
      -- MVT tile boundary
      ST_TileEnvelope(${z}, ${x}, ${y}),
      -- Extent
      ${extent},
      -- Buffer
      ${buffer},
      -- Clip geom
      true
    ) AS mvt_geom
  FROM ${table}
  WHERE
    ST_Intersects(ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 4326), ${geometry})
    and gid_0 is not null and gid_1 is null and gid_2 is null
  `;

  /**
   * @description Creates the query for tile
   */
  createQueryForTile({
    z,
    x,
    y,
    maxZoomLevel,
    table,
    geometry,
    extent,
    buffer,
    // query,
    getBaseQuery = this.defaultGetBaseQuery,
  }: ITileQueryInput): string {
    const queryParts: string[] = [];
    queryParts.push(
      `WITH tile AS (${getBaseQuery({
        x,
        y,
        z,
        table,
        geometry,
        maxZoomLevel,
        buffer,
        extent,
        // attributes: attributesToSelect(attributes),
        // query,
      })})`,
    );

    const sql: string = `${queryParts.join(
      ',\n',
    )}\nSELECT ST_AsMVT(tile, 'layer0',  ${extent}, 'mvt_geom') AS mvt FROM tile`;

    // logger.debug(`Create query for tile: ${sql}`);

    return sql;
  }

  /**
   * BuilDs tile query.
   * @param z The zoom level ranging from 0 - 20
   * @param x The tile x offset on Mercator Projection
   * @param y The tile y offset on Mercator Projection
   * @return the resulting string query.
   */

  buildQuery(
    z: number,
    x: number,
    y: number,
    table: string,
    geometry: string,
    extent: number,
    buffer: number,
    maxZoomLevel: number,
  ): string {
    let query: string = '';

    z = parseInt(`${z}`, 10);
    if (isNaN(z)) {
      throw new Error('Invalid zoom level');
    }

    x = parseInt(`${x}`, 10);
    y = parseInt(`${y}`, 10);
    if (isNaN(x) || isNaN(y)) {
      throw new Error('Invalid tile coordinates');
    }

    try {
      query = this.createQueryForTile({
        z,
        x,
        y,
        maxZoomLevel,
        table,
        geometry,
        extent,
        buffer,
      });
      logger.debug(`Create query for tile: ${query}`);
    } catch (error) {
      logger.error(`Error getting the query: ${error}`);
    }
    return query;
  }

  /**
   * All database interaction is encapsulated in this function. The design-goal is to keep the time where a database-
   * connection is open to a minimum. This reduces the risk for the database-instance to run out of connections.
   * @param query the actual query to be sent to the database engine
   * @return the tile-data as Buffer wrapped in a promise.
   */
  async fetchTileFromDatabase(query: string): Promise<Buffer> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    queryRunner.connect();
    const result = await queryRunner.query(query);
    logger.debug('Query retrieved');
    if (result) {
      return result;
    } else {
      throw new Error("Property 'mvt' does not exist in res.rows[0]");
    }
  }

  /**
   * @description Data compression
   */
  zip(data: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      zlib.gzip(data, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });
  }

  /**
   * The main function that returns a tile in mvt-format.
   * @param z The zoom level ranging from 0 - 20
   * @param x The tile x offset on Mercator Projection
   * @param y The tile y offset on Mercator Projection
   * @return contains the tile-data and some meta-information
   */
  async getTile(
    z: number,
    x: number,
    y: number,
    table: string,
    geometry: string,
    extent: number,
    buffer: number,
    maxZoomLevel: number,
  ): Promise<Tile> {
    const mvt: Tile = { res: 0 };

    //todo - check for valid tile and for valid data source

    const query = this.buildQuery(
      z,
      x,
      y,
      table,
      geometry,
      extent,
      buffer,
      maxZoomLevel,
    );
    logger.debug('Query created');
    let data: any | null = null;
    if (query) {
      try {
        data = await this.fetchTileFromDatabase(query);
        logger.debug('Data succesfully retrieved from database');
      } catch (error) {
        mvt.res = -4;
        mvt.status = `[ERROR] - Database error: ${error.message}`;
        logger.error(`Database error: ${error.message}`);
        return mvt;
      }
    } else {
      // Empty query => empty tile
      const msg = `[INFO] - Empty query for tile '${z}/${x}/${y}'`;
      logger.debug(msg);
      mvt.res = 1;
      mvt.status = msg;
      data = Buffer.from('');
    }
    // zip data
    // logger.debug(data[0].mvt);
    // logger.debug(`uncompressedBytes: ${data[0].mvt.byteLength}`);
    mvt.data = await this.zip(data[0].mvt);
    // logger.debug(`compressedBytes: ${mvt.data.byteLength}`);
    logger.debug('Data compressed');
    return mvt;
  }
}
