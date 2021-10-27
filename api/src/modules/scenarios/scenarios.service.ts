import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { JobStatus, Scenario, ScenarioType } from './scenario.api.entity';

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';

@Injectable()
export class ScenariosService extends AppBaseService<
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
    super(repository, 'scenario', 'scenarios');
  }

  get serializerConfig(): JSONAPISerializerConfig<Scenario> {
    return {
      attributes: [
        'name',
        'description',
        'type',
        'wdpaFilter',
        'wdpaThreshold',
        'numberOfRuns',
        'boundaryLengthModifier',
        'metadata',
        'status',
        'users',
        'createdAt',
        'lastModifiedAt',
      ],
      keyForAttribute: 'camelCase',
      users: {
        ref: 'id',
        attributes: ['fname', 'lname', 'email'],
        projectRoles: {
          ref: 'name',
          attributes: ['name'],
        },
      },
    };
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
      type: ScenarioType.marxan,
      extent: {},
      wdpaFilter: {},
      wdpaThreshold: faker.random.number(100),
      adminRegionId: faker.random.uuid(),
      numberOfRuns: faker.random.number(100),
      boundaryLengthModifier: faker.random.number(100),
      metadata: {},
      status: JobStatus.created,
      users: await Promise.all(
        Array.from({ length: 10 }).map(
          async (_userId) =>
            await this.usersService.fakeFindOne(faker.random.uuid()),
        ),
      ),
    };
    return scenario;
  }

  async setDataCreate(
    create: CreateScenarioDTO,
    info?: AppInfoDTO,
  ): Promise<Scenario> {
    const model = await super.setDataCreate(create, info);
    model.createdBy = info?.authenticatedUser?.id!;
    return model;
  }
}
