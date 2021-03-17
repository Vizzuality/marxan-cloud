import { Injectable, Logger } from '@nestjs/common';
import { TileServerService } from 'modules/vector-tile/vector-tile.service';
import { Vectortile } from 'types/tileRenderer';

const logger = new Logger('admin-areas-service');

@Injectable()
export class AdminAreasService {
  constructor(private readonly tileServerService: TileServerService) {}

  public findTile(
    z: number,
    x: number,
    y: number,
    table: string,
    geometry: string,
    extent: number,
    buffer: number,
    maxZoomLevel: number,
  ): Promise<Vectortile> {
    logger.debug('test_execute');
    return this.tileServerService.getTile(
      z,
      x,
      y,
      (table = 'admin_regions'),
      (geometry = 'the_geom'),
      (extent = 4096),
      (buffer = 256),
      (maxZoomLevel = 12),
    );
  }
}
