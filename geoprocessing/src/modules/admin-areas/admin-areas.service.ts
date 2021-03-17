import { Injectable, Logger } from '@nestjs/common';
// import { Repository, SelectQueryBuilder } from 'typeorm';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { TileServerService } from 'modules/vector-tile/vector-tile.service';
import { Vectortile } from 'types/tileRenderer';

const logger = new Logger('admin-areas-service');

@Injectable()
export class AdminAreasService {
  constructor(private readonly tileServerService: TileServerService) {}

  public findTile(z: number, x: number, y: number): Promise<Vectortile> {
    logger.debug('test_execute');
    return this.tileServerService.getTile(z, x, y);
  }
}
