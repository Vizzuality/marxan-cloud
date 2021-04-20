// to-do: work on cache later
import { Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as zlib from 'zlib';


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
 * @description This function define tile query input for the tile requested
 */
export interface ITileQueryInput extends TileRequest {
  maxZoomLevel: number;
  table: string;
  geometry: string;
  extent: number;
  buffer: number;
  customQuery: string;
  attributes: string;
}

@Injectable()
export class TileService {
  /**
   * @todo add constructor
   * @todo move generation of specific query for each point to the api. Generate this query with the query builder
   * @todo fix geometry issue with gid_0 = 'ATA'. Once is fixed, remove this condition from the query.
   * @description The default base query builder
   */
  private readonly logger: Logger = new Logger(TileService.name);
  createQueryForTile = ({
    x,
    y,
    z,
    table,
    geometry,
    extent,
    buffer,
    customQuery,
    attributes,
  }: ITileQueryInput) => `
  WITH tile AS (
    SELECT
      ${attributes},
      ST_AsMVTGeom(
        -- Geometry from table
        ST_Transform(ST_RemoveRepeatedPoints(${geometry}, 0.1), 3857),
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
      and ${customQuery}
      and not gid_0 ='ATA'
  )
  SELECT ST_AsMVT(tile, 'layer0',  ${extent}, 'mvt_geom') AS mvt FROM tile
  `;

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
    customQuery: string,
    attributes: string,
  ): string {
    let query = '';

    /**
     * @todo apply validation on controller
     */

    z = parseInt(`${z}`, 10);
    if (z > 20) {
      throw new Error('Zoom level should be lower than 20');
    }
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
        customQuery,
        attributes,
      });
      this.logger.debug(`Create query for tile: ${query}`);
    } catch (error) {
      this.logger.error(`Error getting the query: ${error}`);
    }
    return query;
  }

  /**
   * All database interaction is encapsulated in this function. The design-goal is to keep the time where a database-
   * connection is open to a minimum. This reduces the risk for the database-instance to run out of connections.
   * @param query the actual query to be sent to the database engine
   * @return the tile-data as Buffer wrapped in a promise.
   */
  async fetchTileFromDatabase(query: string): Promise<Record<'mvt', Buffer>[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    queryRunner.connect();
    const result = await queryRunner.query(query);
    this.logger.debug('Query retrieved');
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
   *
   * @TODO - check for valid tile and for valid data source
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
    customQuery: string,
    attributes: string,
  ): Promise<Buffer> {
    const query = this.buildQuery(
      z,
      x,
      y,
      table,
      geometry,
      extent,
      buffer,
      maxZoomLevel,
      customQuery,
      attributes,
    );
    this.logger.debug('Query created');
    let data: Buffer = Buffer.from('');
    if (query) {
      try {
        const queryResult: Record<'mvt', Buffer> [] = await this.fetchTileFromDatabase(query);
        this.logger.debug('Data succesfully retrieved from database');
        // zip data
        data = await this.zip(queryResult[0].mvt);
    this.logger.debug('Data compressed');
      } catch (error) {
        this.logger.error(`Database error: ${error.message}`);
        return data;
      }
    }
    return data;
  }
}
