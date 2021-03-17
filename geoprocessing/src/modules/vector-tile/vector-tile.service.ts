// to-do: work on cache later
import { Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { createQueryForTile } from 'utils/vector-tile-builder';
import { zip } from 'utils/vector-tile.utils';
import { Vectortile } from 'types/tileRenderer';

const logger = new Logger('Vector tile service');
@Injectable()
export class TileServerService {
  // todo . add constructor

  /**
   * BuilDs tile query.
   * @param z The zoom level ranging from 0 - 20
   * @param x The tile x offset on Mercator Projection
   * @param y The tile y offset on Mercator Projection
   * @return the resulting string query.
   */
  buildQuery(z: number, x: number, y: number): string {
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
    const table = 'admin_regions';
    const maxZoomLevel = 12;
    const geometry = 'the_geom';
    const extent = 4096;

    try {
      query = createQueryForTile({
        z,
        x,
        y,
        maxZoomLevel,
        table,
        geometry,
        extent,
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
   * @return the vectortile-data as Buffer wrapped in a promise.
   */
  async fetchTileFromDatabase(query: string): Promise<Buffer> {
    //establish real database connection using our new query runner
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    queryRunner.connect();
    const result = await queryRunner.query(query);
    logger.debug('Query retrieved');
    logger.debug(result[0]);
    if (result.rows[0].mvt) {
      return result.rows[0].mvt;
    } else {
      throw new Error("Property 'mvt' does not exist in res.rows[0]");
    }
  }

  /**
   * The main function that returns a vectortile in mvt-format.
   * @param z The zoom level ranging from 0 - 20
   * @param x The tile x offset on Mercator Projection
   * @param y The tile y offset on Mercator Projection
   * @return contains the vectortile-data and some meta-information
   */
  async getTile(
    z: number,
    x: number,
    y: number,
    // table: string,
    // geometry: string,
    // extent: number,
    // maxZoomLevel: number
  ): Promise<Vectortile> {
    const mvt: Vectortile = { res: 0 };

    //todo - check for valid tile and for valid data source

    const query = this.buildQuery(z, x, y);
    logger.debug('Query created');

    let data: Buffer | null = null;
    if (query) {
      try {
        data = await this.fetchTileFromDatabase(query);
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
    mvt.data = await zip(data);
    logger.debug('gzip');

    return mvt;
  }

  // public getTile(z: number, x: number, y: number): number { // Promise<TileRenderer<T>>

  //   try {
  //     let query: string;
  //     z = parseInt(`${z}`, 10);
  //     if (isNaN(z)) {
  //       throw new Error('Invalid zoom level');
  //     }

  //     x = parseInt(`${x}`, 10);
  //     y = parseInt(`${y}`, 10);
  //     if (isNaN(x) || isNaN(y)) {
  //       throw new Error('Invalid tile coordinates');
  //     }
  //     const table = 'admin_regions';
  //     const maxZoomLevel = 12;
  //     const geometry = 'the_geom';
  //     const extent = 4096;

  //     //generate the query
  //     try {
  //       query = createQueryForTile({
  //         z,
  //         x,
  //         y,
  //         maxZoomLevel,
  //         table,
  //         geometry,
  //         extent,
  //       });
  //       logger.debug(`Create query for tile: ${query}`);

  //       //establish real database connection using our new query runner
  //       const connection = getConnection();
  //       const queryRunner = connection.createQueryRunner();
  //       queryRunner.connect();
  //       const result = queryRunner.query(query);
  //       logger.debug('Query retrieved');

  //       // const tile = await zip(result.rows[0].mvt)
  //       logger.debug('gzip');

  //       // return 0;
  //     } catch (error) {
  //       logger.error(`Error getting the query: ${error}`);
  //     }
  //     // logger.debug('hello world');
  //     // return 0;
  //   } catch (error) {
  //     logger.debug(`Error in connect: ${error}`);
  //   }
  //   return 0;
  // }
}
