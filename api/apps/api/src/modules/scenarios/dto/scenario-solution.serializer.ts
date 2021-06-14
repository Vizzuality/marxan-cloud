import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';
import { SolutionResultCrudService } from '../solutions-result/solution-result-crud.service';

@Injectable()
export class ScenarioSolutionSerializer {
  constructor(
    private readonly scenariosSolutionsCrudService: SolutionResultCrudService,
  ) {}

  async serialize(
    entities:
      | Partial<ScenariosOutputResultsGeoEntity>
      | (Partial<ScenariosOutputResultsGeoEntity> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.scenariosSolutionsCrudService.serialize(
      entities,
      paginationMeta,
    );
  }
}
