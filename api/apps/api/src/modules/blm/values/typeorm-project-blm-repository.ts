import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/Either';

import {
  ProjectBlmRepository,
  ProjectBlm,
  GetFailure,
  SaveFailure,
  CreateFailure,
} from './project-blm-repository';

@Injectable()
export class TypeormProjectBlmRepository extends ProjectBlmRepository {
  async get(projectId: string): Promise<Either<GetFailure, ProjectBlm>> {
    return right({
      id: projectId,
      range: [0, 0],
      values: [0, 0, 0, 0, 0, 0],
      defaults: [0, 0, 0, 0, 0, 0],
    });
  }

  async create(
    projectId: string,
    defaults: ProjectBlm['defaults'],
  ): Promise<Either<CreateFailure, true>> {
    return right(true);
  }

  async update(
    projectId: string,
    range: ProjectBlm['range'],
    values: ProjectBlm['values'],
  ): Promise<Either<SaveFailure, true>> {
    return right(true);
  }
}
