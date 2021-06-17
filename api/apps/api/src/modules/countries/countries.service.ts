import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository } from 'typeorm';
import { Country } from './country.geo.entity';
import { CreateCountryDTO } from './dto/create.country.dto';
import { UpdateCountryDTO } from './dto/update.country.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { apiConnections } from '../../ormconfig';
import { AppConfig } from '@marxan-api/utils/config.utils';

@Injectable()
export class CountriesService extends AppBaseService<
  Country,
  CreateCountryDTO,
  UpdateCountryDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Country, apiConnections.geoprocessingDB.name)
    private readonly countriesRepository: Repository<Country>,
  ) {
    super(countriesRepository, 'country', 'countries', {
      idProperty: 'gid0',
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  async getByGid0(country: string): Promise<Country | undefined> {
    const query = this.repository.createQueryBuilder(this.alias);
    query.where(`${this.alias}.gid0 = :country`, { country });
    return await query.getOne();
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

  async fakeFindOne(_id: string): Promise<Country> {
    return this.serialize([
      {
        ...new Country(),
        // faker.address.countryCode() gives alpha2 codes, but we need alpha3
        // here, so (marginally) better to hardcode something here instead 🤷.
        gid0: faker.address.countryCode('ESP'),
        name0: faker.address.country(),
      },
    ]);
  }
}
