import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ScenarioFeaturesGapDataService } from '@marxan-api/modules/scenarios-features/scenario-features-gap-data.service';
import { ScenarioFeaturesGapData } from '@marxan/features';

@Injectable()
export class ScenarioFeaturesGapDataSerializer {
  constructor(private readonly crudService: ScenarioFeaturesGapDataService) {}

  async serialize(
    entities: Partial<ScenarioFeaturesGapData> | (Partial<ScenarioFeaturesGapData> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.crudService.serialize(entities, paginationMeta);
  }
}
