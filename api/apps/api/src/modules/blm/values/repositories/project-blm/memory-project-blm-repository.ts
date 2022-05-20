import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { defaultBlmRange } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

import {
  alreadyCreated,
  Blm,
  CreateFailure,
  GetProjectFailure,
  ProjectBlmRepo,
  projectNotFound,
  SaveFailure,
} from '../../blm-repos';

@Injectable()
export class MemoryProjectBlmRepository extends ProjectBlmRepo {
  constructor(private readonly memory: Record<string, Blm | undefined> = {}) {
    super();
  }
  async get(projectId: string): Promise<Either<GetProjectFailure, Blm>> {
    const blm = this.memory[projectId];
    if (!blm) return left(projectNotFound);

    return right(blm);
  }

  async create(
    projectId: string,
    defaults: Blm['defaults'],
  ): Promise<Either<CreateFailure, true>> {
    if (this.memory[projectId]) return left(alreadyCreated);

    this.memory[projectId] = {
      defaults,
      id: projectId,
      range: defaultBlmRange,
      values: [],
    };

    return right(true);
  }

  async update(
    projectId: string,
    range: Blm['range'],
    values: Blm['values'],
  ): Promise<Either<SaveFailure, true>> {
    const blm = this.memory[projectId];
    if (!blm) return left(projectNotFound);

    this.memory[projectId] = {
      ...blm,
      range,
      values,
    };
    return right(true);
  }
}
