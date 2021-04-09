import { Injectable, Logger } from '@nestjs/common';
import { TileService, Tile } from 'src/modules/tile/tile.service';

// I need to extent to the appBaseService
@Injectable()
export class AdminAreasService {
  private readonly logger: Logger = new Logger(AdminAreasService.name);
  constructor(
    // @InjectRepository(AdminAreas, 'geoprocessingDB')
    // private readonly adminAreasRepository: Repository<AdminAreas>,
    private readonly tileService: TileService,
  ) {
    // super(adminAreasRepository, 'admin_area', 'admin_areas');
  }

  public findTile(
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
  ): Promise<Tile> {
    this.logger.debug('test_execute_tile_service');
    return this.tileService.getTile(
      z,
      x,
      y,
      (table = 'admin_regions'),
      (geometry = 'the_geom'),
      (extent = 4096),
      (buffer = 256),
      (maxZoomLevel = 12),
      (customQuery = 'gid_0 is not null and gid_1 is null and gid_2 is null'),
      (attributes = 'gid_0, gid_1, gid_2'),
    );
  }
}
