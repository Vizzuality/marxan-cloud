import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import { Country } from './country.geo.entity';
import { CreateCountryDTO } from './dto/create.country.dto';
import { UpdateCountryDTO } from './dto/update.country.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';

@Injectable()
export class CountriesService extends AppBaseService<
  Country,
  CreateCountryDTO,
  UpdateCountryDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Country, 'geoprocessingDB')
    private readonly countriesRepository: Repository<Country>,
  ) {
    super(countriesRepository, 'country', 'countries');
  }

  get serializerConfig(): JSONAPISerializerConfig<Country> {
    return {
      transform: (item: Country) => ({ ...item, id: item.gid0 }),
      attributes: ['gid0', 'name0', 'theGeom'],
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
