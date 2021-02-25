import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AdminArea } from './admin-area.geo.entity';
import { CreateAdminAreaDTO } from './dto/create.admin-area.dto';
import { UpdateAdminAreaDTO } from './dto/update.admin-area.dto';

import * as faker from 'faker';
import { AppBaseService } from 'utils/app-base.service';

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
    super(adminAreasRepository, 'admin-area', 'admin-areas');
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
}
