import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ProjectsCrudService } from '../projects-crud.service';
import { Project, ProjectResultSingular } from '../project.api.entity';
import { isDefined } from '@marxan/utils';
import { AsyncJobDto } from '@marxan-api/dto/async-job.dto';

@Injectable()
export class ProjectSerializer {
  constructor(private readonly projectsCrud: ProjectsCrudService) {}

  async serialize(
    entities: Partial<Project> | undefined,
    paginationMeta?: PaginationMeta,
    asyncJobTriggered?: boolean,
  ): Promise<ProjectResultSingular> {
    if (!isDefined(entities)) {
      throw new NotFoundException();
    }
    const result = await this.projectsCrud.serialize(entities, paginationMeta);
    return {
      ...result,
      meta: {
        ...(result?.meta ?? {}),
        ...(asyncJobTriggered ? AsyncJobDto.forProject() : {}),
      },
    };
  }

  async serializeAll(
    entities: (Partial<Project> | undefined)[] | undefined,
    paginationMeta?: PaginationMeta,
  ) {
    if (!isDefined(entities)) {
      throw new NotFoundException();
    }
    return await this.projectsCrud.serialize(entities, paginationMeta);
  }
}
