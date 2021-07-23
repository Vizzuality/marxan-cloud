import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { Repository } from 'typeorm';
import { FeatureIdToScenarioFeatureData } from '../feature-id-to-scenario-feature-data';

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
