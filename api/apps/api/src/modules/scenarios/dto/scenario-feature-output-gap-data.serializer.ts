import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ScenarioFeaturesOutputGapDataService } from '@marxan-api/modules/scenarios-features/scenario-features-output-gap-data.service';
import { ScenarioFeaturesOutputGapData } from '@marxan/features';

@Injectable()
export class ScenarioFeaturesOutputGapDataSerializer {
  constructor(
    private readonly crudService: ScenarioFeaturesOutputGapDataService,
  ) {}

  async serialize(
    entities:
      | Partial<ScenarioFeaturesOutputGapData>
      | (Partial<ScenarioFeaturesOutputGapData> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.crudService.serialize(entities, paginationMeta);
  }
}
