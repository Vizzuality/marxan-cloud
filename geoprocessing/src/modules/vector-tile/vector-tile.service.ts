// to-do: work on cache later
//import { Cache, defaultCacheOptions} from './cache';
import { Injectable, Logger } from '@nestjs/common';
import {getConnection} from "typeorm";

const logger = new Logger('Vector tile service');
@Injectable()
export class TileServerService {

  public getTile(): number {
    const connection = getConnection('apiDB');
    const queryRunner = connection.createQueryRunner();
    // establish real database connection using our new query runner
    queryRunner.connect();

    // now we can execute any queries on a query runner, for example:
    queryRunner.query("SELECT * FROM users");

    logger.debug('hello world')
    return 0
  }
}
