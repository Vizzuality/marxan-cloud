import { Injectable } from '@nestjs/common';
import { FeatureIdToScenarioFeatureData } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters/solutions-output/geo-output/scenario-features/feature-id-to-scenario-feature-data';
import { InjectRepository } from '@nestjs/typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { Repository } from 'typeorm';

@Injectable()
export class ScenarioFeatureIdMapper {
  constructor(
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeatureData: Repository<ScenarioFeaturesData>,
  ) {}

  async getMapping(scenarioId: string) {
    const planningUnits = await this.scenarioFeatureData.findAndCount({
      where: {
        scenarioId,
      },
      select: ['id', 'featureId'],
    });
    return planningUnits[0].reduce<FeatureIdToScenarioFeatureData>(
      (previousValue, sfd) => {
        previousValue[sfd.featureId] = sfd.id;
        return previousValue;
      },
      {},
    );
  }
}
