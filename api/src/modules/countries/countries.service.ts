import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { BaseService } from 'nestjs-base-service';
import { Repository } from 'typeorm';
import { Country } from './country.entity';
import { CreateCountryDTO } from './dto/create.country.dto';
import { UpdateCountryDTO } from './dto/update.country.dto';

import JSONAPISerializer = require('jsonapi-serializer');

import * as faker from 'faker';

@Injectable()
export class CountriesService extends BaseService<
  Country,
  CreateCountryDTO,
  UpdateCountryDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {
    super(countriesRepository, 'country');
    this.serializer = new JSONAPISerializer.Serializer('countries', {
      attributes: ['id', 'name'],
      keyForAttribute: 'camelCase',
      users: {
        ref: 'id',
        attributes: ['id', 'name'],
      },
    });
  }

  serializer;

  async serialize(entities: Country[]) {
    return this.serializer.serialize(entities);
  }

  async fakeFindOne(_id: string): Promise<Country> {
    return this.serializer.serialize({
      ...new Country(),
      id: faker.address.countryCode(),
      name: faker.address.country(),
    });
  }

  async findAll(): Promise<Country[]> {
    return this.countriesRepository.find();
  }
}
