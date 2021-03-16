import { Injectable, Logger } from '@nestjs/common';
import { TileServerService } from 'modules/vector-tile/vector-tile.service';

const logger = new Logger('admin-areas-service');

@Injectable()
export class AdminAreasService {
  constructor(private readonly tileServerService: TileServerService) {}

  public findTile(z: number, x: number, y: number): number {
    logger.debug('test_execute');
    return this.tileServerService.getTile(z, x, y);
  }
}
