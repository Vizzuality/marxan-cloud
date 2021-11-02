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
import { Repository } from 'typeorm';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { publishedProjectResource } from '@marxan-api/modules/published-project/published-project.resource';

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
      attributes: ['name', 'description'],
      keyForAttribute: 'camelCase',
    };
  }
}
