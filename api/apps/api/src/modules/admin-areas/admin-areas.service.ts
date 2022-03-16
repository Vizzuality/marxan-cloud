import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateAdminAreaDTO } from './dto/create.admin-area.dto';
import { UpdateAdminAreaDTO } from './dto/update.admin-area.dto';

import {
  AppBaseService,
  JSONAPISerializerConfig,
  PaginationMeta,
} from '@marxan-api/utils/app-base.service';
import { FetchSpecification, FetchUtils } from 'nestjs-base-service';
import { omit } from 'lodash';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { AdminArea } from '@marxan/admin-regions';
import { DbConnections } from '@marxan-api/ormconfig.connections';

/**
 * Supported admin area levels (sub-national): either level 1 or level 2.
 */
export class AdminAreaLevel {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  @Transform(({ value: level }: { value: string }) => parseInt(level))
  level?: 1 | 2;
}

/**
 * Possible filters for AdminAreas
 */
type AdminAreaFilters = {
  /**
   * Id of parent country if filtering admin areas by parent country.
   */
  countryId: string;

  /**
   * Id of level 1 area if filtering level 2 admin areas by parent level 1 area.
   */
  level2AreaByArea1Id: string;
} & AdminAreaLevel;

@Injectable()
export class AdminAreasService extends AppBaseService<
  AdminArea,
  CreateAdminAreaDTO,
  UpdateAdminAreaDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(AdminArea, DbConnections.geoprocessingDB)
    private readonly adminAreasRepository: Repository<AdminArea>,
  ) {
    super(adminAreasRepository, 'admin_area', 'admin_areas', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  get serializerConfig(): JSONAPISerializerConfig<AdminArea> {
    return {
      transform: (item: AdminArea) => ({ ...item, id: item.gid2 ?? item.gid1 }),
      attributes: [
        'gid0',
        'name0',
        'gid1',
        'name1',
        'gid2',
        'name2',
        'theGeom',
        'bbox',
        'minPuAreaSize',
        'maxPuAreaSize',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  setFilters(
    query: SelectQueryBuilder<AdminArea>,
    filters?: AdminAreaFilters,
    _info?: AppInfoDTO,
  ): SelectQueryBuilder<AdminArea> {
    if (filters?.countryId) {
      query.andWhere(`${this.alias}.gid0 = :countryId`, {
        countryId: filters.countryId,
      });
    }

    if (filters?.level2AreaByArea1Id) {
      query.andWhere(
        `${this.alias}.gid1 = :parentLevel1AreaId AND ${this.alias}.gid2 IS NOT NULL`,
        { parentLevel1AreaId: filters.level2AreaByArea1Id },
      );
    }

    if (filters?.level === 2) {
      query.andWhere(`${this.alias}.gid2 IS NOT NULL`);
    }

    if (filters?.level === 1) {
      query.andWhere(
        `${this.alias}.gid1 IS NOT NULL AND ${this.alias}.gid2 IS NULL`,
      );
    }

    return query;
  }

  /**
   * Get Admin Area (level 1 or level 2) by its id.
   *
   * We only rely on the id provided for the lookup: we search for a level 1 or
   * level 2 area depending on the pattern of the id provided.
   */
  async getByLevel1OrLevel2Id(
    areaId: string,
    fetchSpecification?: FetchSpecification,
  ): Promise<Partial<AdminArea>> {
    const query = this.repository.createQueryBuilder(this.alias);
    const queryWithFilters = FetchUtils.processFetchSpecification<AdminArea>(
      query,
      this.alias,
      fetchSpecification,
    );
    if (this.isLevel1AreaId(areaId)) {
      query.where(
        `${this.alias}.gid1 = :areaId AND ${this.alias}.gid2 IS NULL`,
        { areaId },
      );
    }
    if (this.isLevel2AreaId(areaId)) {
      query.where(`${this.alias}.gid2 = :areaId`, { areaId });
    }

    const results = await queryWithFilters.getOne();
    if (!results) {
      throw new NotFoundException(`No such administrative area (${areaId}).`);
    }
    const result = fetchSpecification?.omitFields?.length
      ? omit(results, fetchSpecification.omitFields)
      : results;
    return result;
  }

  async getChildrenAdminAreas(
    parentAreaId: string,
    fetchSpecification?: FetchSpecification,
  ): Promise<{
    data: (AdminArea | Partial<AdminArea> | undefined)[];
    metadata: PaginationMeta | undefined;
  }> {
    if (this.isLevel1AreaId(parentAreaId)) {
      return this.findAllPaginated({
        ...fetchSpecification,
        filter: {
          ...fetchSpecification?.filter,
          level2AreaByArea1Id: parentAreaId,
        },
      });
    } else {
      throw new BadRequestException(
        'Lookup of subdivisions is only supported for level 1 admin areas.',
      );
    }
  }

  /**
   * Check if an admin are id is that of a GADM level 1 area.
   *
   * @testsNeeded @unitTests @propBasedTests
   */
  isLevel1AreaId(areaId: string): boolean {
    return AdminAreasService.levelFromId(areaId) === 1;
  }

  /**
   * Check if an admin are id is that of a GADM level 2 area.
   *
   * @testsNeeded @unitTests @propBasedTests
   */
  isLevel2AreaId(areaId: string): boolean {
    return AdminAreasService.levelFromId(areaId) === 2;
  }

  /**
   * Given an admin area id, return its level.
   *
   * @testsNeeded @unitTests @propBasedTests
   */
  static levelFromId(areaId: string): number {
    return areaId.match(/\./g)?.length ?? 0;
  }
}
