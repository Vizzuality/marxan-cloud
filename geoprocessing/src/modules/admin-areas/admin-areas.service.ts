import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsInt, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { AdminArea } from 'src/modules/admin-areas/admin-areas.geo.entity';
import { filter } from 'lodash';

export class TileSpecification extends TileRequest {
  @ApiProperty()
  @Min(0)
  @Max(2)
  @IsInt()
  @Transform((value) => Number.parseInt(value))
  level!: number;
}

export type AdminAreasFilters = {
  guid: string;
};

@Injectable()
export class AdminAreasService {
  private readonly logger: Logger = new Logger(AdminAreasService.name);
  constructor(
    @InjectRepository(AdminArea)
    private readonly adminAreasRepository: Repository<AdminArea>,
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

  buildAdminAreaWhereQuery(level: number, filters?: AdminAreasFilters): string {
    let whereQuery = '';
    if (level === 0) {
      if (filters?.guid) {
        whereQuery = `gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL AND gid_0 = '${filters?.guid}'`;
      } else {
        whereQuery = `gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL`;
      }
    }
    if (level === 1) {
      if (filters?.guid) {
        whereQuery = `gid_1 IS NOT NULL AND gid_2 IS NULL AND gid_0 = '${filters?.guid}'`;
      } else {
        whereQuery = `gid_1 IS NOT NULL AND gid_2 IS NULL AND gid_0 != 'ATA'`;
      }
    }
    if (level === 2) {
      if (filters?.guid) {
        whereQuery = `gid_2 IS NOT NULL and  gid_1 = '${filters?.guid}'`;
      } else {
        whereQuery = `gid_2 IS NOT NULL`;
      }
    }
    return whereQuery;
  }

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: TileSpecification,
    filters?: AdminAreasFilters,
  ): Promise<Buffer> {
    const { z, x, y, level } = tileSpecification;

    const attributes = 'name_0, name_1, name_2';
    const table = this.adminAreasRepository.metadata.tableName;
    const customQuery = this.buildAdminAreaWhereQuery(level, filters);
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
