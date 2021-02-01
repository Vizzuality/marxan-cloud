import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { BaseService } from 'nestjs-base-service';
import { Repository } from 'typeorm';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { Scenario } from './scenario.api.entity';

import JSONAPISerializer = require('jsonapi-serializer');

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class ScenariosService extends BaseService<
  Scenario,
  CreateScenarioDTO,
  UpdateScenarioDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Scenario)
    protected readonly repository: Repository<Scenario>,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(repository, 'scenario');
    this.serializer = new JSONAPISerializer.Serializer('scenarios', {
      attributes: ['name', 'description', 'type', 'users'],
      keyForAttribute: 'camelCase',
      users: {
        ref: 'id',
        attributes: ['fname', 'lname', 'email'],
        projectRoles: {
          ref: 'name',
          attributes: ['name'],
        },
      },
    });
  }

  serializer;

  async serialize(entities: Scenario[]) {
    return this.serializer.serialize(entities);
  }

  async importLegacyScenario(_file: Express.Multer.File): Promise<Scenario> {
    return new Scenario();
  }

  async fakeFindOne(_id: string): Promise<Scenario> {
    const scenario = {
      ...new Scenario(),
      id: faker.random.uuid(),
      name: faker.lorem.words(5),
      description: faker.lorem.sentence(),
      users: await Promise.all(
        Array.from({ length: 10 }).map(
          async (_userId) =>
            await this.usersService.fakeFindOne(faker.random.uuid()),
        ),
      ),
    };
    return scenario;
  }

  async findAll(): Promise<Scenario[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Scenario | undefined> {
    return this.repository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
