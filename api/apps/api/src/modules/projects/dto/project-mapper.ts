import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '../../../utils/app-base.service';
import { ProjectsCrud } from '../projects-crud';
import { Project } from '../project.api.entity';

@Injectable()
export class ProjectMapper {
  constructor(private readonly projectsCrud: ProjectsCrud) {}

  async serialize(
    entities: Partial<Project> | (Partial<Project> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.projectsCrud.serialize(entities, paginationMeta);
  }
}
