import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { JobStatus, Scenario, ScenarioType } from './scenario.api.entity';

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { PickType } from '@nestjs/swagger';
import { castArray } from 'lodash';

export class ScenarioFilters extends PickType(Scenario, [
  'name',
  'type',
  'projectId',
  'status',
] as const) {}
@Injectable()
export class ScenariosService extends AppBaseService<
  Scenario,
  CreateScenarioDTO,
  UpdateScenarioDTO,
  AppInfoDTO
> {
  private readonly logger = new Logger(ScenariosService.name);

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

  /**
   * Apply service-specific filters.
   *
   * @debt Most of the plain filters for entity properties will be identical
   * across filters and across services: we should abstract this into an utility
   * function to avoid boilerplate and error-prone copy-and-paste.
   */
  setFilters(
    query: SelectQueryBuilder<Scenario>,
    filters: ScenarioFilters,
    info?: AppInfoDTO,
  ): SelectQueryBuilder<Scenario> {
    if (filters?.name?.length) {
      query.andWhere(`${this.alias}.name IN (:...name)`, {
        name: castArray(filters.name),
      });
    }
    if (filters?.projectId?.length) {
      query.andWhere(`${this.alias}.projectId IN (:...projectId)`, {
        projectId: castArray(filters.projectId),
      });
    }
    if (filters?.type?.length) {
      query.andWhere(`${this.alias}.type IN (:...type)`, {
        type: castArray(filters.type),
      });
    }
    if (filters?.status?.length) {
      query.andWhere(`${this.alias}.status IN (:...status)`, {
        status: castArray(filters.status),
      });
    }
    return query;
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
