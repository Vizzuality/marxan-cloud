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
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { publishedProjectResource } from '@marxan-api/modules/published-project/published-project.resource';
import { FetchSpecification } from 'nestjs-base-service';
import { UsersService } from '../users/users.service';
import { ExportId } from '../clone';
import { ExportRepository } from '../clone/export/application/export-repository.port';

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
}
