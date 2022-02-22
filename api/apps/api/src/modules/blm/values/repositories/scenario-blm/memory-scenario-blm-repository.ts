import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';

import {
  alreadyCreated,
  Blm,
  CreateFailure,
  GetScenarioFailure,
  projectNotFound,
  SaveFailure,
  SaveSuccess,
  ScenarioBlmRepo,
  scenarioNotFound,
} from '../../blm-repos';

@Injectable()
export class MemoryScenarioBlmRepository extends ScenarioBlmRepo {
  constructor(private readonly memory: Record<string, Blm | undefined> = {}) {
    super();
  }
  async get(scenarioId: string): Promise<Either<GetScenarioFailure, Blm>> {
    const blm = this.memory[scenarioId];
    if (!blm) return left(scenarioNotFound);

    return right(blm);
  }

  async create(
    scenarioId: string,
    defaults: Blm['defaults'],
  ): Promise<Either<CreateFailure, true>> {
    if (this.memory[scenarioId]) return left(alreadyCreated);

    this.memory[scenarioId] = {
      defaults,
      id: scenarioId,
      range: [0.001, 100],
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

  async copy(
    scenarioId: string,
    blm: Blm,
  ): Promise<Either<CreateFailure, SaveSuccess>> {
    if (this.memory[scenarioId]) return left(alreadyCreated);

    this.memory[scenarioId] = {
      ...blm,
      id: scenarioId,
    };

    return right(true);
  }
}
