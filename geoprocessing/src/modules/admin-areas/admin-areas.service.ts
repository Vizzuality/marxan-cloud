import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  TileService,
  TileRequest,
  TileRenderer,
} from 'src/modules/tile/tile.service';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IsInt, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { AdminArea } from 'src/modules/admin-areas/admin-areas.geo.entity';
import { inspect } from 'util';
export class TileSpecification extends TileRequest {
  @ApiProperty()
  @Min(0)
  @Max(2)
  @IsInt()
  @Transform((value) => Number.parseInt(value))
  level: number;
}

@Injectable()
export class AdminAreasService {
  private readonly logger: Logger = new Logger(AdminAreasService.name);
  constructor(
    @InjectRepository(AdminArea)
    private readonly adminAreasRepository: Repository<AdminArea>,
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

  /**
   *
   * @todo generate the custom queries using query builder and the entity data.
   * @todo move the string to int transformation to the AdminAreaLevelFilters class
   */
  buildAdminAreaWhereQuery(level: number): string {
    let whereQuery = '';
    if (level === 0) {
      whereQuery = `gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL`;
    }
    if (level === 1) {
      whereQuery = `gid_1 IS NOT NULL AND gid_2 IS NULL`;
    }
    if (level === 2) {
      whereQuery = `gid_2 IS NOT NULL`;
    }
    return whereQuery;
  }

  /**
   * @todo get this query from query builder
   * @todo apply validation on the controller
   * @todo update the function to include guid apiQuery param
   */
  public findTile(tileSpecification: TileSpecification): Promise<Buffer> {
    const { z, x, y, level } = tileSpecification;
    const attributes = 'name_0';
    const table = this.adminAreasRepository.metadata.tableName;
    const geometry = 'the_geom';
    const extent = 4096;
    const buffer = 256;
    const maxZoomLevel = 12;
    const customQuery = this.buildAdminAreaWhereQuery(level);
    this.logger.debug(
      inspect(
        this.adminAreasRepository.metadata.ownColumns.map((column) => {
          if (column.isSelect) {
            return column.entityMetadata.targetName;
          }
        }),
      ),
    );
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
