import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';

@Injectable()
export class ProjectsService extends AppBaseService<
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Project)
    protected readonly repository: Repository<Project>,
    @Inject(ScenariosService)
    private readonly scenariosService: ScenariosService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(repository, 'project', 'projects');
  }

  get serializerConfig(): JSONAPISerializerConfig<Project> {
    return {
      attributes: [
        'name',
        'description',
        'countryId',
        'adminAreaLevel1Id',
        'adminAreaLevel2Id',
        'planningUnitGridShape',
        'planningUnitAreakm2',
        'users',
        'scenarios',
        'createdAt',
        'lastModifiedAt',
      ],
      keyForAttribute: 'camelCase',
      users: {
        ref: 'id',
        attributes: ['fname', 'lname', 'email', 'projectRoles'],
        projectRoles: {
          ref: 'name',
          attributes: ['name'],
        },
      },
      scenarios: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'type',
          'wdpaFilter',
          'wdpaThreshold',
          'adminRegionId',
          'numberOfRuns',
          'boundaryLengthModifier',
          'metadata',
          'status',
          'createdAt',
          'lastModifiedAt',
        ],
      },
    };
  }

  async importLegacyProject(_file: Express.Multer.File): Promise<Project> {
    return new Project();
  }

  async fakeFindOne(_id: string): Promise<Project> {
    const project = {
      ...new Project(),
      id: faker.random.uuid(),
      name: faker.lorem.words(5),
      description: faker.lorem.sentence(),
      users: await Promise.all(
        Array.from({ length: 10 }).map(
          async (_userId) =>
            await this.usersService.fakeFindOne(faker.random.uuid()),
        ),
      ),
      attributes: await Promise.all(
        Array.from({ length: 5 }).map(
          async (_scenarioId) =>
            await this.scenariosService.fakeFindOne(faker.random.uuid()),
        ),
      ),
    };
    return project;
  }

  async setDataCreate(
    create: CreateProjectDTO,
    info?: AppInfoDTO,
  ): Promise<Project> {
    /**
     * @debt Temporary setup. I think we should remove TimeUserEntityMetadata
     * from entities and just use a separate event log, and a view to obtain the
     * same information (who created an entity and when, and when it was last
     * modified) from that log, kind of event sourcing way.
     */
    const project = await super.setDataCreate(create, info);
    project.createdBy = info?.authenticatedUser?.id!;
    return project;
  }
}
