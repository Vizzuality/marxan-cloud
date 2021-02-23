import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
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
      attributes: ['alpha2', 'alpha3', 'name'],
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
}
