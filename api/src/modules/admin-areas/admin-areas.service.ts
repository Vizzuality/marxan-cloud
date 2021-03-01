import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AdminArea } from './admin-area.geo.entity';
import { CreateAdminAreaDTO } from './dto/create.admin-area.dto';
import { UpdateAdminAreaDTO } from './dto/update.admin-area.dto';

import * as faker from 'faker';
import { AppBaseService } from 'utils/app-base.service';
import { FetchSpecification, FetchUtils } from 'nestjs-base-service';
import { omit } from 'lodash';

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

  get serializerConfig() {
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
    filters: any,
    _info?: AppInfoDTO,
  ): SelectQueryBuilder<AdminArea> {
    if (filters.countryId) {
      query.andWhere(`"${this.alias}"."gid_0" = :countryId`, {
        countryId: filters.countryId,
      });
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

  isLevel1AreaId(areaId: string): boolean {
    return areaId.match(/\./g)?.length === 1;
  }

  isLevel2AreaId(areaId: string): boolean {
    return areaId.match(/\./g)?.length === 2;
  }
}
