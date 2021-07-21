import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { SolutionResultCrudService } from '../solutions-result/solution-result-crud.service';

@Injectable()
export class ScenarioSolutionSerializer {
  constructor(
    private readonly scenariosSolutionsCrudService: SolutionResultCrudService,
  ) {}

  async serialize(
    entities:
      | Partial<ScenariosOutputResultsApiEntity>
      | (Partial<ScenariosOutputResultsApiEntity> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.scenariosSolutionsCrudService.serialize(
      entities,
      paginationMeta,
    );
  }
}
