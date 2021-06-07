import { HttpService, Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { ScenariosCrudService } from '@marxan-api/modules/scenarios/scenarios-crud.service';
import { ScenarioFeaturesService } from '@marxan-api/modules/scenarios-features';
import { AdjustPlanningUnits } from '@marxan-api/modules/analysis/entry-points/adjust-planning-units';
import { CostSurfaceFacade } from '@marxan-api/modules/scenarios/cost-surface/cost-surface.facade';

@Injectable()
export class ScenarioService {
  private readonly geoprocessingUrl: string = AppConfig.get(
    'geoprocessing.url',
  ) as string;

  constructor(
    public readonly service: ScenariosCrudService,
    private readonly scenarioFeatures: ScenarioFeaturesService,
    private readonly updatePlanningUnits: AdjustPlanningUnits,
    private readonly costSurface: CostSurfaceFacade,
    private readonly httpService: HttpService,
  ) {}
}
