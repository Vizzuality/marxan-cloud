import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import { Country } from './country.api.entity';
import { CreateCountryDTO } from './dto/create.country.dto';
import { UpdateCountryDTO } from './dto/update.country.dto';

import * as faker from 'faker';
import { AppBaseService } from 'utils/app-base.service';

@Injectable()
export class CountriesService extends AppBaseService<
  Country,
  CreateCountryDTO,
  UpdateCountryDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {
    super(countriesRepository, 'country', 'countries');
  }

  get serializerConfig() {
    return {
      attributes: ['alpha2', 'alpha3', 'name'],
      keyForAttribute: 'camelCase',
    };
  }

  async fakeFindOne(_id: string): Promise<Country> {
    return this.serialize([
      {
        ...new Country(),
        alpha2: faker.address.countryCode(),
        name: faker.address.country(),
      },
    ]);
  }
}
