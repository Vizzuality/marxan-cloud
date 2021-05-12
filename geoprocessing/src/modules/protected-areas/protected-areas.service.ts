import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsOptional, IsString } from 'class-validator';

import { ProtectedArea } from 'src/modules/protected-areas/protected-areas.geo.entity';

export class ProtectedAreasFilters {
  @IsOptional()
  @IsString()
  id: string;
}

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
  public findTile(
    tileSpecification: TileRequest,
    filters?: ProtectedAreasFilters
    ): Promise<Buffer> {
    const { z, x, y } = tileSpecification;
    const attributes = 'full_name, status, wdpaid';
    const table = this.protectedAreasRepository.metadata.tableName;
    const customQuery = filters?.id ? ` id = '${filters?.id}'` :  undefined;
    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      customQuery,
      attributes,
    });
  }
}
