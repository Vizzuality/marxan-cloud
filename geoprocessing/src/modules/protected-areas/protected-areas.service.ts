import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProtectedArea } from 'src/modules/protected-areas/protected-areas.geo.entity';

@Injectable()
export class ProtectedAreasService {
  private readonly logger: Logger = new Logger(ProtectedAreasService.name);
  constructor(
    @InjectRepository(ProtectedArea)
    private readonly protectedAreasRepository: Repository<ProtectedArea>,
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(tileSpecification: TileRequest): Promise<Buffer> {
    const { z, x, y } = tileSpecification;
    const attributes = 'full_name, status, wdpaid';
    const table = this.protectedAreasRepository.metadata.tableName;
    const geometry = 'the_geom';
    const extent = 4096;
    const buffer = 256;
    const maxZoomLevel = 12;
    const customQuery = undefined;
    return this.tileService.getTile({
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
    });
  }
}
