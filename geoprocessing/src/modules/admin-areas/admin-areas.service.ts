import { Injectable, Logger } from '@nestjs/common';
import { IsInt, Max, Min } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transform } from 'class-transformer';
import { isMainThread } from 'worker_threads';
import {
  AppBaseService,
  JSONAPISerializerConfig,
  // PaginationMeta,
} from 'utils/app-base.service';

import { TileService, Tile } from 'modules/tile/tile.service';
import { AdminAreas } from './admin-areas.geo.entity';
import { CreateAdminAreaDTO } from './dto/create.admin-areas-dto';
import { UpdateAdminAreaDTO } from './dto/update.admin-areas.dto';
import { AppInfoDTO } from 'dto/info.dto';
import { query } from 'express';

const logger = new Logger('admin-areas-service');

/**
 * Supported admin area levels (national and sub-national): either level 0, 1 or level 2.
 */

export class AdminAreaLevel {
  @IsInt()
  @Min(0)
  @Max(2)
  // @Transform((level: string) => parseInt(level))
  level: any; //1 | 2;
}

/**
 * Possible filters for AdminAreas
 */
type AdminAreasFilters = {
  /**
   * Id of parent country if filtering admin areas by parent country.
   */
  countryId: string;

  /**
   * Id of level 1 area if filtering level 2 admin areas by parent level 1 area.
   */
  level2AreaByArea1Id: string;
} & AdminAreaLevel;

// I need to extent to the appBaseService
@Injectable()
export class AdminAreasService {
  constructor(
    // @InjectRepository(AdminAreas, 'geoprocessingDB')
    // private readonly adminAreasRepository: Repository<AdminAreas>,
    private readonly tileService: TileService,
  ) {
    // super(adminAreasRepository, 'admin_area', 'admin_areas');
  }

  get serializerConfig(): JSONAPISerializerConfig<AdminAreas> {
    return {
      transform: (item: AdminAreas) => ({
        ...item,
        id: item.gid2 ?? item.gid1,
      }),
      attributes: [
        'gid0',
        'name0',
        'gid1',
        'name1',
        'gid2',
        'name2',
        'theGeom',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  public computeFilters(
    query: SelectQueryBuilder<AdminAreas>,
    filters: AdminAreasFilters,
    alias = 'c',
  ): SelectQueryBuilder<AdminAreas> {
    if (filters.countryId) {
      query.andWhere(`${alias}.gid0 = :countryId`, {
        countryId: filters.countryId,
      });
    }

    // DO WE NEED TO DO THE SAME FOR level1AreaByArea0Id?
    if (filters.level2AreaByArea1Id) {
      query.andWhere(
        `${alias}.gid1 = :parentLevel1AreaId AND ${alias}.gid2 IS NOT NULL`,
        { parentLevel1AreaId: filters.level2AreaByArea1Id },
      );
    }

    if (filters?.level === 2) {
      query.andWhere(`${alias}.gid2 IS NOT NULL`);
    }

    // maybe we need to extend these two queries below by the other missing level?
    if (filters?.level === 1) {
      query.andWhere(`${alias}.gid1 IS NOT NULL AND ${alias}.gid2 IS NULL`);
    }

    if (filters?.level === 0) {
      query.andWhere(`${alias}.gid0 IS NOT NULL AND ${alias}.gid1 IS NULL`);
    }

    return query;
  }

  private computeQueryParameterFilters(
    filters: string,
    query: SelectQueryBuilder<AdminAreas>,
    alias = 'c',
  ): SelectQueryBuilder<AdminAreas> {
    if (filters && filters.length > 0) {
      const filterObj = Object.assign({}, ...JSON.parse(filters));
      return this.computeFilters(query, filterObj, alias);
    }
    return query;
  }

  public async findAdminArreaData(): Promise<any> {}

  // todo- add data app info?
  // setFilters(
  //   query: SelectQueryBuilder<AdminAreas>,
  //   filters: AdminAreasFilters,
  //   _info?: any,
  // ): SelectQueryBuilder<AdminAreas> {
  //   if (filters.countryId) {
  //     query.andWhere(`${this.alias}.gid0 = :countryId`, {
  //       countryId: filters.countryId,
  //     });
  //   }

  //   return query
  // };

  public findTile(
    z: number,
    x: number,
    y: number,
    table: string,
    geometry: string,
    extent: number,
    buffer: number,
    maxZoomLevel: number,
  ): Promise<Tile> {
    logger.debug('test_execute_tile_service');
    return this.tileService.getTile(
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
