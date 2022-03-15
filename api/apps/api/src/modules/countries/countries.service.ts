import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository } from 'typeorm';
import { Country } from './country.geo.entity';
import { CreateCountryDTO } from './dto/create.country.dto';
import { UpdateCountryDTO } from './dto/update.country.dto';

import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class CountriesService extends AppBaseService<
  Country,
  CreateCountryDTO,
  UpdateCountryDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Country, DbConnections.geoprocessingDB)
    private readonly countriesRepository: Repository<Country>,
  ) {
    super(countriesRepository, 'country', 'countries', {
      idProperty: 'gid0',
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  async getByGid0(country: string): Promise<Country | undefined> {
    return this.repository.findOne({
      where: {
        gid0: country,
      },
    });
  }

  async getIdAndNameByGid0(
    country: string,
  ): Promise<Pick<Country, 'id' | 'gid0' | 'name0'> | undefined> {
    return await this.repository.findOne({
      where: {
        gid0: country,
      },
      select: ['id', 'gid0', 'name0'],
    });
  }

  async getBBoxByGid0(
    country: string,
  ): Promise<Pick<Country, 'bbox' | 'gid0'> | undefined> {
    return await this.repository.findOne({
      where: {
        gid0: country,
      },
      select: ['bbox', 'gid0'],
    });
  }

  get serializerConfig(): JSONAPISerializerConfig<Country> {
    return {
      transform: (item: Country) => ({ ...item, id: item.gid0 }),
      attributes: [
        'gid0',
        'name0',
        'theGeom',
        'bbox',
        'minPuAreaSize',
        'maxPuAreaSize',
      ],
      keyForAttribute: 'camelCase',
    };
  }
}
