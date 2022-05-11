import { Injectable } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ProjectsRequest } from '@marxan-api/modules/projects/project-requests-info';
import {
  CreatePublishedProjectDto,
  UpdatePublishedProjectDto,
} from '@marxan-api/modules/published-project/dto/create-published-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { publishedProjectResource } from '@marxan-api/modules/published-project/published-project.resource';
import { FetchSpecification } from 'nestjs-base-service';
import { UsersService } from '../users/users.service';
import { ExportId } from '../clone';
import { ExportRepository } from '../clone/export/application/export-repository.port';
import { Project } from '../projects/project.api.entity';
import { UsersProjectsApiEntity } from '../access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectRoles } from '../access-control/projects-acl/dto/user-role-project.dto';
import { groupBy } from 'lodash';

@Injectable()
export class PublishedProjectCrudService extends AppBaseService<
  PublishedProject,
  CreatePublishedProjectDto,
  UpdatePublishedProjectDto,
  ProjectsRequest
> {
  constructor(
    @InjectRepository(PublishedProject)
    protected repository: Repository<PublishedProject>,
    @InjectRepository(UsersProjectsApiEntity)
    private usersProjectsRepo: Repository<UsersProjectsApiEntity>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private readonly usersService: UsersService,
    private exportRepo: ExportRepository,
  ) {
    super(
      repository,
      publishedProjectResource.name.singular,
      publishedProjectResource.name.plural,
      {
        logging: { muteAll: AppConfig.getBoolean('logging.muteAll', false) },
      },
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<PublishedProject> {
    return {
      attributes: [
        'name',
        'description',
        'location',
        'creators',
        'company',
        'resources',
        'underModeration',
        'originalProject',
        'pngData',
        'exportId',
        'ownerEmails',
      ],
      keyForAttribute: 'camelCase',
      originalProject: {
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
          'planningAreaId',
          'planningAreaName',
          'bbox',
          'customProtectedAreas',
        ],
      },
    };
  }

  async extendGetByIdResult(
    entity: PublishedProject,
    _fetchSpecification?: FetchSpecification,
    _info?: ProjectsRequest,
  ): Promise<PublishedProject> {
    const exportIdString = entity?.exportId;

    if (exportIdString) {
      const exportId = new ExportId(exportIdString);
      const finalExport = await this.exportRepo.find(exportId);
      if (!finalExport?.hasFinished()) {
        delete entity.exportId;
      }
    }

    return entity;
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<PublishedProject>,
    fetchSpecification?: FetchSpecification,
    info?: ProjectsRequest,
  ): Promise<SelectQueryBuilder<PublishedProject>> {
    const userId = info?.authenticatedUser?.id;

    const { namesSearch } = info?.params ?? {};

    if (namesSearch) {
      const namesSearchFilterField = 'namesSearchFilter' as const;
      query.andWhere(
        `(${this.alias}.name
          ||' '|| COALESCE(${this.alias}.description, '')
          ) ILIKE :${namesSearchFilterField}`,
        { [namesSearchFilterField]: `%${namesSearch}%` },
      );
    }

    /*
      If we are listing projects for non-authenticated requests or for
      authenticated users who are not admin, projects under moderation
      will be hiding from the listing.
    */
    if (!userId || !(await this.usersService.isPlatformAdmin(userId))) {
      query.andWhere('published_project.underModeration is false');
    }

    return query;
  }

  async extendFindAllResults(
    entitiesAndCount: [PublishedProject[], number],
    fetchSpecification?: FetchSpecification,
    info?: ProjectsRequest,
  ): Promise<[PublishedProject[], number]> {
    const userId = info?.authenticatedUser?.id;

    if (!userId || !(await this.usersService.isPlatformAdmin(userId))) {
      return entitiesAndCount;
    }

    const allOwnersOfAllProjectsPlusEmail = await this.usersProjectsRepo.query(
      `
      select up.project_id, u.email
        from users_projects as up
           left join users as u
                on (u."id" = up.user_id)
        where up.project_id IN (SELECT id FROM published_projects) AND up.role_id = $1;`,
      [ProjectRoles.project_owner],
    );
    const ownersPerProject = groupBy(
      allOwnersOfAllProjectsPlusEmail,
      (item) => item.project_id,
    );

    const extendedEntities: PublishedProject[] = entitiesAndCount[0].map(
      (entity) => ({
        ...entity,
        ownerEmails: ownersPerProject[entity.id].map((item) => item.email),
      }),
    );

    return [extendedEntities, entitiesAndCount[1]];
  }
}
