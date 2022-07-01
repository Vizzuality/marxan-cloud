import { BlmPartialResultEntity } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-partial-results.geo.entity';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ScenarioFeaturesData } from '@marxan/features';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { UnusedResources } from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

type ScenarioUnusedResourcesData = Record<string, unknown>;

@Injectable()
export class ScenarioUnusedResources
  implements UnusedResources<ScenarioUnusedResourcesData> {
  constructor(
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeaturesDataRepo: Repository<ScenarioFeaturesData>,
    @InjectRepository(BlmFinalResultEntity)
    private readonly blmFinalResultRepo: Repository<BlmFinalResultEntity>,
    @InjectRepository(BlmPartialResultEntity)
    private readonly blmPartialResultRepo: Repository<BlmPartialResultEntity>,
    @InjectRepository(MarxanExecutionMetadataGeoEntity)
    private readonly marxanExecutionMetadataRepo: Repository<MarxanExecutionMetadataGeoEntity>,
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}
  async removeUnusedResources(scenarioId: string): Promise<void> {
    await this.scenarioFeaturesDataRepo.delete({ scenarioId });

    await this.blmFinalResultRepo.delete({ scenarioId });

    await this.blmPartialResultRepo.delete({ scenarioId });

    await this.marxanExecutionMetadataRepo.delete({ scenarioId });

    await this.scenarioPuDataRepo.delete({ scenarioId });
  }
}
