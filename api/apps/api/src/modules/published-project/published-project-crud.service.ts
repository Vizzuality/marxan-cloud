import { Injectable } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { UpdatePublishedProjectDto } from '@marxan-api/modules/published-project/dto/update-published-project.dto';
import { ProjectsRequest } from '@marxan-api/modules/projects/project-requests-info';
import { CreatePublishedProjectDto } from '@marxan-api/modules/published-project/dto/create-published-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { publishedProjectResource } from '@marxan-api/modules/published-project/published-project.resource';
import { FetchSpecification } from 'nestjs-base-service';
import { UsersService } from '../users/users.service';

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
  ) {
    super(
      repository,
      publishedProjectResource.name.singular,
      publishedProjectResource.name.plural,
      {
        logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
      },
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<PublishedProject> {
    return {
      attributes: ['name', 'description', 'isUnpublished'],
      keyForAttribute: 'camelCase',
    };
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<PublishedProject>,
    fetchSpecification: FetchSpecification,
    info?: ProjectsRequest,
  ): Promise<SelectQueryBuilder<PublishedProject>> {
    let showUnpublishedProjects = false;
    const id = info?.authenticatedUser?.id;
    if (id && (await this.usersService.isPlatformAdmin(id))) {
      showUnpublishedProjects = true;
    }

    query.andWhere('published_project.isUnpublished = :isUnpublished', {
      isUnpublished: showUnpublishedProjects,
    });

    return query;
  }
}
