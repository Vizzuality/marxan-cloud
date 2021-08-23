import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Either, isLeft } from 'fp-ts/Either';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ProjectsCrudService } from '../projects-crud.service';
import { Project } from '../project.api.entity';

import { CanReadError } from '../acl';

type AllErrors = CanReadError;

@Injectable()
export class ProjectSerializer {
  constructor(private readonly projectsCrud: ProjectsCrudService) {}

  async serialize(
    result: Either<
      AllErrors,
      // TODO should include paginationMeta
      Partial<Project> | (Partial<Project> | undefined)[]
    >,
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    if (isLeft(result)) {
      throw new InternalServerErrorException(result.left);
    }
    return this.projectsCrud.serialize(result.right, paginationMeta);
  }
}
