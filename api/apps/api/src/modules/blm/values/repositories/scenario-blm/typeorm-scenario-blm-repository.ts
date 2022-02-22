import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { ScenarioBlm } from '@marxan-api/modules/blm/values/repositories/scenario-blm/scenario-blm.api.entity';

@Injectable()
export class TypeormScenarioBlmRepository extends ScenarioBlmRepo {
  constructor(
    @InjectRepository(ScenarioBlm)
    private readonly repository: Repository<ScenarioBlm>,
  ) {
    super();
  }
  async get(
    scenarioId: string,
  ): Promise<Either<GetScenarioFailure, ScenarioBlm>> {
    const scenarioBlm = await this.repository.findOne(scenarioId);

    return scenarioBlm ? right(scenarioBlm) : left(scenarioNotFound);
  }

  async update(
    scenarioId: string,
    range: ScenarioBlm['range'],
    values: ScenarioBlm['values'],
  ): Promise<Either<SaveFailure, true>> {
    const result = await this.repository.update(
      { id: scenarioId },
      { range, values },
    );

    return Boolean(result.affected) ? right(true) : left(projectNotFound);
  }

  async copy(
    scenarioId: string,
    blm: Blm,
  ): Promise<Either<CreateFailure, SaveSuccess>> {
    if (await this.repository.findOne(scenarioId)) return left(alreadyCreated);

    const scenarioBlm = await this.repository.create();
    scenarioBlm.id = scenarioId;
    scenarioBlm.defaults = blm.defaults;
    scenarioBlm.values = blm.values;
    scenarioBlm.range = blm.range;

    await this.repository.save(scenarioBlm);

    return right(true);
  }
}
