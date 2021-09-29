import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { Scenario, ScenarioResult } from '../scenario.api.entity';
import { ScenariosCrudService } from '../scenarios-crud.service';
import { plainToClass } from 'class-transformer';
import { AsyncJobDto } from '@marxan-api/dto/async-job.dto';

@Injectable()
export class ScenarioSerializer {
  constructor(private readonly scenariosCrudService: ScenariosCrudService) {}

  async serialize(
    entities: Partial<Scenario> | (Partial<Scenario> | undefined)[],
    paginationMeta?: PaginationMeta,
    asyncJobTriggered?: boolean,
  ): Promise<ScenarioResult> {
    const result = await this.scenariosCrudService.serialize(
      entities,
      paginationMeta,
    );
    return plainToClass(ScenarioResult, {
      ...result,
      meta: {
        ...(result?.meta ?? {}),
        ...(asyncJobTriggered ? AsyncJobDto.forScenario() : {}),
      },
    });
  }
}
