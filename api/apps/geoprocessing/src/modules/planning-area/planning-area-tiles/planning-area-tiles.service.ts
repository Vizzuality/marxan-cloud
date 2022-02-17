import { Injectable, Inject, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
} from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Transform } from 'class-transformer';
import { CustomPlanningAreaRepository } from '@marxan/planning-area-repository';
import { BBox } from 'geojson';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { nominatim2bbox } from '@marxan-geoprocessing/utils/bbox.utils';
import { TileRequest } from '@marxan/tiles';

export class TileSpecification extends TileRequest {
  @ApiProperty()
  @IsUUID()
  @Transform((value) => Number.parseInt(value))
  planningAreaId!: string;
}

@Injectable()
export class PlanningAreaTilesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly repository: CustomPlanningAreaRepository,

    @Inject('TileService')
    private readonly tileService: TileService,
  ) {}

  buildCustomPlanningAreaWhereQuery(planningAreaId: UUID): string {
    /**
     * @todo this generation query is a bit...
     */
    let whereQuery = '';
    if (level === 0) {
      whereQuery = `gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL AND gid_0 != 'ATA'`;
    }
    if (level === 1) {
      whereQuery = `gid_1 IS NOT NULL AND gid_2 IS NULL`;
    }
    if (level === 2) {
      whereQuery = `gid_2 IS NOT NULL`;
    }
    if (filters?.guid) {
      whereQuery += ` AND gid_${level} = '${filters?.guid}'`;
    }
    if (filters?.bbox) {
      whereQuery += ` AND the_geom && ST_MakeEnvelope(${nominatim2bbox(
        filters?.bbox,
      )}, 4326)`;
    }

    return whereQuery;
  }
  // buildAdminPlanningAreaWhereQuery(level: number, filters?: AdminAreasFilters): string {
  //   /**
  //    * @todo this generation query is a bit...
  //    */
  //   let whereQuery = '';
  //   if (level === 0) {
  //     whereQuery = `gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL AND gid_0 != 'ATA'`;
  //   }
  //   if (level === 1) {
  //     whereQuery = `gid_1 IS NOT NULL AND gid_2 IS NULL`;
  //   }
  //   if (level === 2) {
  //     whereQuery = `gid_2 IS NOT NULL`;
  //   }
  //   if (filters?.guid) {
  //     whereQuery += ` AND gid_${level} = '${filters?.guid}'`;
  //   }
  //   if (filters?.bbox) {
  //     whereQuery += ` AND the_geom && ST_MakeEnvelope(${nominatim2bbox(
  //       filters?.bbox,
  //     )}, 4326)`;
  //   }

  //   return whereQuery;
  // }

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: TileSpecification
  ): Promise<Buffer> {
    const { z, x, y, planningAreaId } = tileSpecification;
    const attributes = 'name_0, name_1, name_2, gid_0, gid_1, gid_2';
    const table = this.repository.metadata.tableName;
    const customQuery = this.buildAdminAreaWhereQuery(planningAreaId);
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
