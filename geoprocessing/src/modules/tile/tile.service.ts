// to-do: work on cache later
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as zlib from 'zlib';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min, } from 'class-validator';
import { TileSpecification } from '../admin-areas/admin-areas.service';

/**
 * @description The specification of the tile request
 */
export class TileRequest {
  /**
   * @description The zoom level ranging from 0 - 20
   */
  @IsInt()
  @Min(0)
  @Max(20)
  @Transform((i) => Number.parseInt(i))
  z: number;

  /**
   * @description The tile x offset on Mercator Projection
   */
  @IsInt()
  @Transform((i) => Number.parseInt(i))
  x: number;

  /**
   * @description The tile y offset on Mercator Projection
   */
  @IsInt()
  @Transform((i) => Number.parseInt(i))
  y: number;
}

/**
 * @description This function define tile query input for the tile query requested
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

/**
 * @description Configuration options for the tile service
 * @todo add cache options
 */
export interface TileServiceConfig<T> {
  /**
   * @description Max zoom level for data rendering
   */
  maxZoomLevel: number;
  /**
   * @description Custom query for the different entities
   */
  customQuery: string;
  /**
   * @description attributes to be retrieved from the different entities
   */
  attributes: string;
}

/**
 * @description The required input values for the tile renderer
 */
export interface TileInput<T> extends TileRequest {
  /**
   * @description The name of the table
   */
  table: string;
  /**
   * @description The geometry column name, default is "The_geom". This column should be of type Geometry in PostGIS
   */
  geometry?: string;
  /**
   * @description The tile extent is the grid dimension value as specified by ST_AsMVT. The default is 4096.
   * @see https://postgis.net/docs/ST_AsMVT.html
   */
  extent?: number;
  /**
   * @description Max zoom level for data rendering
   */
  maxZoomLevel?: number;
   /**
   * @description The buffer around the tile extent in the number of grid cells as specified by ST_AsMVT. The default is 256.
   * @see https://postgis.net/docs/ST_AsMVT.html
   */
  buffer?: number;
  /**
   * @description Custom query for the different entities
   */
  customQuery: string,
  /**
   * @description attributes to be retrieved from the different entities
   */
  attributes: string,
}


/**
 * @description This function creates the MVT tiles from the appropriate TileInput
 */
export type TileRenderer<T> = (args: TileInput<T>) => Promise<ArrayBuffer>;



/**
 * @todo add generic type
 */
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
    { z, x, y }: Pick<TileSpecification, 'z' | 'x' | 'y'>,
    table: string,
    geometry: string,
    extent: number,
    buffer: number,
    maxZoomLevel: number,
    customQuery: string,
    attributes: string,
  ): string {
    let query = '';

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

  // getTileService({
  //   maxZoomLevel = 12,
  //   customQuery = 'gid_2 is not null',
  //   attributes = 'gid_2'
  // }: TileServerConfig<T>): Promise<TileRenderer<T>> {
  //   return async this.getTile(
  //     z: number,
  //     x: number,
  //     y: number,
  //     table: string,
  //     geometry: string,
  //     extent: number,
  //     buffer: number,
  //     maxZoomLevel: number,
  //     customQuery: string,
  //     attributes: string,
  //   )
  // }

  /**
   * The main function that returns a tile in mvt-format.
   * @param z The zoom level ranging from 0 - 20
   * @param x The tile x offset on Mercator Projection
   * @param y The tile y offset on Mercator Projection
   * @return contains the tile-data and some meta-information
   *
   * @todo check for valid tile and for valid data source
   * @todo Add tile server config type to getTile function
   * @todo add tile render type to promise
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
      {
        z,
        x,
        y
      },
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
