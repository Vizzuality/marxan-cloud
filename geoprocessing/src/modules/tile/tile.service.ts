// to-do: work on cache later
import { Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as zlib from 'zlib';

/**
 * @description This function creates the MVT tiles from the appropriate TileInput
 */
// export type TileRenderer = (args: TileInput) => Promise<ArrayBuffer>;

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
  getTileQuery?: GetTileQuery;
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
  }: // maxZoomLevel,
  // attributes,
  // query,
  IBaseQueryInput) => `
  SELECT
    ${geometry}
  FROM ${table}
  WHERE
    ST_Intersects(ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 4326), ${geometry})
  `;

  /**
   * @description The default tile query builder
   */
  defaultGetTileQuery: GetTileQuery = ({
    x,
    y,
    z,
    table,
    geometry,
    extent,
    buffer,
  }: // bufferSize,
  // attributes,
  ITileQuery) => `
  SELECT
    ST_AsMVTGeom(ST_Transform(${geometry}, 3857), ST_TileEnvelope(${z}, ${x}, ${y}), ${extent}, ${buffer}, false) AS geom
  FROM ${table}
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
    getTileQuery = this.defaultGetTileQuery,
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
        buffer,
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
        buffer,
        // attributes: attributesToArray(attributes),
      })})`,
    );

    const sql: string = `${queryParts.join(
      ',\n',
    )}\nSELECT ST_AsMVT(tile, 'geom') AS mvt FROM tile`;

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
    // const table = 'admin_regions';
    // const maxZoomLevel = 12;
    // const geometry = 'the_geom';
    // const extent = 4096;

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
    // logger.debug(result[0]);
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
        logger.debug(`Database error: ${error.message}`);
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
    logger.debug(data[0].mvt);
    logger.debug(`uncompressedBytes: ${data[0].mvt.byteLength}`);
    mvt.data = data[0].mvt; //await this.zip(data[0].mvt);
    // logger.debug(`compressedBytes: ${mvt.data.byteLength}`);
    logger.debug('Data compressed');
    return mvt;
  }
}
