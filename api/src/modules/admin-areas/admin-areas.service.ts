import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AdminArea } from './admin-area.geo.entity';
import { CreateAdminAreaDTO } from './dto/create.admin-area.dto';
import { UpdateAdminAreaDTO } from './dto/update.admin-area.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerAttributesConfig,
  JSONAPISerializerConfig,
  PaginationMeta,
} from 'utils/app-base.service';
import { FetchSpecification, FetchUtils } from 'nestjs-base-service';
import { omit } from 'lodash';

/**
 * Supported admin area levels (sub-national): either level 1 or level 2.
 */
export class AdminAreaLevel {
  level: 1 | 2;
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
    @InjectRepository(AdminArea, 'geoprocessingDB')
    private readonly adminAreasRepository: Repository<AdminArea>,
  ) {
    super(adminAreasRepository, 'admin_area', 'admin_areas');
  }

  get serializerConfig(): JSONAPISerializerConfig<AdminArea> {
    return {
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

  async fakeFindOne(_id: string): Promise<AdminArea> {
    return this.serialize({
      ...new AdminArea(),
      name0: faker.address.country(),
      name1: faker.address.state(),
    });
  }

  setFilters(
    query: SelectQueryBuilder<AdminArea>,
    filters: AdminAreaFilters,
    _info?: AppInfoDTO,
  ): SelectQueryBuilder<AdminArea> {
    if (filters.countryId) {
      query.andWhere(`${this.alias}.gid0 = :countryId`, {
        countryId: filters.countryId,
      });
    }

    if (filters.level2AreaByArea1Id) {
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
    fetchSpecification: FetchSpecification,
    areaId: string,
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
    fetchSpecification: FetchSpecification,
    parentAreaId: string,
  ): Promise<{
    data: (AdminArea | Partial<AdminArea> | undefined)[];
    metadata: PaginationMeta;
  }> {
    if (this.isLevel1AreaId(parentAreaId)) {
      return this.findAllPaginated(fetchSpecification, undefined, {
        level2AreaByArea1Id: parentAreaId,
      });
    } else {
      throw new BadRequestException(
        'Lookup of subdivisions is only supported for level 1 admin areas.',
      );
    }
  }

  isLevel1AreaId(areaId: string): boolean {
    return areaId.match(/\./g)?.length === 1;
  }

  isLevel2AreaId(areaId: string): boolean {
    return areaId.match(/\./g)?.length === 2;
  }
}
