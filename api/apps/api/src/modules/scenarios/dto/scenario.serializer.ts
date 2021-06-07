import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { Scenario } from '../scenario.api.entity';
import { ScenariosCrudService } from '../scenarios-crud.service';

@Injectable()
export class ScenarioSerializer {
  constructor(private readonly scenariosCrudService: ScenariosCrudService) {}

  async serialize(
    entities: Partial<Scenario> | (Partial<Scenario> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.scenariosCrudService.serialize(entities, paginationMeta);
  }
}
