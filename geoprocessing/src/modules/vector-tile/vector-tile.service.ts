// to-do: work on cache later
//import { Cache, defaultCacheOptions} from './cache';
import { Injectable, Logger } from '@nestjs/common';
import { query } from 'express';
import { getConnection } from 'typeorm';

import { createQueryForTile } from 'utils/vector-tile-builder';
import { zip } from 'utils/vector-tile.utils';
// import { TileRenderer } from 'types/tileRenderer';

const logger = new Logger('Vector tile service');
@Injectable()
export class TileServerService {
  public getTile(z: number, x: number, y: number): number {
    try {
      let query: string;
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

      //generate the query
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

        //establish real database connection using our new query runner
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        queryRunner.connect();
        const result = queryRunner.query(query);
        logger.debug('Query retrieved');

        // const tile = await zip(result.rows[0].mvt)
        logger.debug('gzip');

        // return 0;
      } catch (error) {
        logger.error(`Error getting the query: ${error}`);
      }
      // logger.debug('hello world');
      // return 0;
    } catch (error) {
      logger.debug(`Error in connect: ${error}`);
    }
    return 0;
  }
}
