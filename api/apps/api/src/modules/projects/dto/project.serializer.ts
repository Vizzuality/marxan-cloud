import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ProjectsCrudService } from '../projects-crud.service';
import { Project } from '../project.api.entity';
import { isDefined } from '@marxan/utils';

@Injectable()
export class ProjectSerializer {
  constructor(private readonly projectsCrud: ProjectsCrudService) {}

  async serialize(
    entities: Partial<Project> | (Partial<Project> | undefined)[] | undefined,
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    if (!isDefined(entities)) {
      throw new NotFoundException();
    }
    return this.projectsCrud.serialize(entities, paginationMeta);
  }
}
