import { Injectable } from '@nestjs/common';
import { ScenarioFeatureData } from './scenario-feature-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { FeatureIdToScenarioFeatureData } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters/solutions-output/geo-output/scenario-features/feature-id-to-scenario-feature-data';

@Injectable()
export class ScenarioFeaturesDataService {
  // iterate over all mv* files
  // stream their content to transformer

  constructor(
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeatureData: Repository<ScenarioFeaturesData>,
  ) {}

  async from(
    outputDirectory: string,
    scenarioId: string,
  ): Promise<ScenarioFeatureData[]> {
    const planningUnits = await this.scenarioFeatureData.findAndCount({
      where: {
        scenarioId,
      },
      select: ['id', 'featureId'],
    });
    const _mapping = planningUnits[0].reduce<FeatureIdToScenarioFeatureData>(
      (previousValue, sfd) => {
        previousValue[sfd.featureId] = sfd.id;
        return previousValue;
      },
      {},
    );
    console.log(`--- scenario features data mapping`, _mapping);
    return [];
  }
}
