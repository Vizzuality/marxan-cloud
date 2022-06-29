import { ScenarioFeaturesData } from '@marxan/features';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { specDatFeatureIdPropertyKey } from '../../../../../../legacy-project-import/legacy-piece-importers/features.legacy-piece-importer';
import { FeatureIdToScenarioFeatureData } from '../feature-id-to-scenario-feature-data';

@Injectable()
export class LegacyProjectImportScenarioFeatureIdMapper {
  constructor(
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeatureData: Repository<ScenarioFeaturesData>,
  ) {}

  async getMapping(scenarioId: string) {
    const records = await this.scenarioFeatureData.find({
      select: ['id', 'prop', 'featureData'],
      relations: ['featureData'],
      where: {
        scenarioId,
      },
    });

    return records.reduce<FeatureIdToScenarioFeatureData>(
      (previousValue, sfd) => {
        const specId =
          sfd.featureData.properties?.[specDatFeatureIdPropertyKey];

        if (typeof specId === 'number') {
          previousValue[specId] = {
            id: sfd.id,
            prop: sfd.prop ?? 0.5,
          };
        }

        return previousValue;
      },
      {},
    );
  }
}
