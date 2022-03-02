import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification } from 'nestjs-base-service';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { Scenario } from './scenario.api.entity';
import { UsersService } from '@marxan-api/modules/users/users.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProtectedAreasCrudService } from '@marxan-api/modules/protected-areas/protected-areas-crud.service';
import { ProjectsCrudService } from '@marxan-api/modules/projects/projects-crud.service';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { assertDefined } from '@marxan/utils';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';

const scenarioFilterKeyNames = ['name', 'type', 'projectId', 'status'] as const;
type ScenarioFilterKeys = keyof Pick<
  Scenario,
  typeof scenarioFilterKeyNames[number]
>;
type ScenarioFilters = Record<ScenarioFilterKeys, string[]>;

export type ScenarioInfoDTO = AppInfoDTO & {
  params?: {
    nameAndDescriptionFilter?: string;
  };
};

@Injectable()
export class ScenariosCrudService extends AppBaseService<
  Scenario,
  CreateScenarioDTO,
  UpdateScenarioDTO,
  ScenarioInfoDTO
> {
  constructor(
    @InjectRepository(Scenario)
    protected readonly repository: Repository<Scenario>,
    @InjectRepository(Project)
    protected readonly projectRepository: Repository<Project>,
    @Inject(UsersService) protected readonly usersService: UsersService,
    @Inject(ProtectedAreasCrudService)
    protected readonly protectedAreasService: ProtectedAreasCrudService,
    @Inject(forwardRef(() => ProjectsCrudService))
    protected readonly projectsService: ProjectsCrudService,
    @InjectRepository(UsersScenariosApiEntity)
    private readonly userScenarios: Repository<UsersScenariosApiEntity>,
  ) {
    super(repository, 'scenario', 'scenarios', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  get serializerConfig(): JSONAPISerializerConfig<Scenario> {
    return {
      attributes: [
        'id',
        'name',
        'description',
        'type',
        'protectedAreaFilterByIds',
        'customProtectedAreaIds',
        'wdpaIucnCategories',
        'wdpaThreshold',
        'numberOfRuns',
        'boundaryLengthModifier',
        'metadata',
        'status',
        'projectId',
        'project',
        'users',
        'createdAt',
        'createdByUser',
        'lastModifiedAt',
        'ranAtLeastOnce',
      ],
      keyForAttribute: 'camelCase',
      project: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'countryId',
          'adminAreaLevel1Id',
          'adminAreaLevel2Id',
          'planningUnitGridShape',
          'planningUnitAreakm2',
          'createdAt',
          'lastModifiedAt',
        ],
      },
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

  /**
   * Apply service-specific filters.
   */
  setFilters(
    query: SelectQueryBuilder<Scenario>,
    filters: ScenarioFilters,
    _info?: ScenarioInfoDTO,
  ): SelectQueryBuilder<Scenario> {
    query = this._processBaseFilters<ScenarioFilters>(
      query,
      filters,
      scenarioFilterKeyNames,
    );
    return query;
  }

  async setDataCreate(
    create: CreateScenarioDTO,
    info?: ScenarioInfoDTO,
  ): Promise<Scenario> {
    const model = await super.setDataCreate(create, info);
    assertDefined(model.projectId);
    /**
     * @TODO figure out the best way to re-enable the eslint rule
     */
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    model.createdBy = info?.authenticatedUser?.id!;
    return model;
  }

  async assignCreatorRole(scenarioId: string, userId: string): Promise<void> {
    await this.userScenarios.save({
      scenarioId,
      userId,
      roleName: ScenarioRoles.scenario_owner,
      isImplicit: false,
    });
  }

  async setDataUpdate(
    model: Scenario,
    update: UpdateScenarioDTO,
    info?: ScenarioInfoDTO,
  ): Promise<Scenario> {
    update.projectId = (
      await this.projectRepository.findOne({
        where: {
          id: model.projectId,
        },
      })
    )?.id;
    assertDefined(update.projectId);
    model = await super.setDataUpdate(model, update, info);
    if (model.metadata?.marxanInputParameterFile) {
      model.metadata.marxanInputParameterFile = Object.assign(
        model.metadata.marxanInputParameterFile,
        update.metadata?.marxanInputParameterFile,
      );
    }

    return model;
  }

  /**
   * Could be that entity-relations in codebase are wrong
   * https://github.com/typeorm/typeorm/blob/master/docs/many-to-many-relations.md#many-to-many-relations-with-custom-properties
   *
   * Thus, when using `remove(EntityInstance)` it complains on missing
   * `user_id`.
   *
   * `delete` seems to omit code-declarations and use db's cascades
   */
  async remove(id: string): Promise<void> {
    await this.repository.delete({
      id,
    });
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<Scenario>,
    fetchSpecification: FetchSpecification,
    info?: ScenarioInfoDTO,
  ): Promise<SelectQueryBuilder<Scenario>> {
    const nameAndDescriptionFilter = info?.params?.nameAndDescriptionFilter;
    const loggedUser = info?.authenticatedUser;

    query.leftJoin(
      UsersScenariosApiEntity,
      `acl`,
      `${this.alias}.id = acl.scenario_id`,
    );

    if (nameAndDescriptionFilter) {
      const nameAndDescriptionFilterField = 'nameAndDescriptionFilter' as const;
      query.andWhere(
        `(${this.alias}.name ||' '|| COALESCE(${this.alias}.description, '')) ILIKE :${nameAndDescriptionFilterField}`,
        { [nameAndDescriptionFilterField]: `%${nameAndDescriptionFilter}%` },
      );
    }

    if (loggedUser) {
      query
        .andWhere(`acl.user_id = :userId`, {
          userId: info?.authenticatedUser?.id,
        })
        .andWhere(`acl.role_id IN (:...roleId)`, {
          roleId: [
            Roles.scenario_owner,
            Roles.scenario_contributor,
            Roles.scenario_viewer,
          ],
        });
    }

    return query;
  }
}
