import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification } from 'nestjs-base-service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';

import { ScenariosFeaturesView } from './entities/scenarios-features.view.api.entity';
import { AppInfoDTO } from '../../dto/info.dto';
import { RemoteScenarioFeaturesData } from './entities/remote-scenario-features-data.geo.entity';
import { remoteConnectionName } from './entities/remote-connection-name';

// TODO view migration

@Injectable()
export class ScenarioFeaturesService extends AppBaseService<
  ScenariosFeaturesView,
  never,
  never,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(ScenariosFeaturesView)
    private readonly features: Repository<ScenariosFeaturesView>,
    @InjectRepository(RemoteScenarioFeaturesData, remoteConnectionName)
    private readonly remoteFeatures: Repository<RemoteScenarioFeaturesData>,
  ) {
    super(features);
  }

  async extendGetByIdResult(
    entity: ScenariosFeaturesView,
    fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<ScenariosFeaturesView> {
    if (!this.withScenarioId(entity)) {
      return entity;
    }
    const dataToExtend = await this.remoteFeatures.find({
      where: {
        scenario_id: entity.id,
      },
    });
    return entity;
  }

  async extendFindAllResults(
    entitiesAndCount: [any[], number],
    fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<[any[], number]> {
    const entities = entitiesAndCount[0] as ScenariosFeaturesView[];
    const scenarioIds = entities
      .filter(this.withScenarioId)
      .map((sfv) => sfv.id);

    const dataToExtend = await this.remoteFeatures.find({
      where: {
        scenario_id: In(scenarioIds),
      },
    });

    // TODO priv method
    const extended = entities.map((entity) => {
      const extensionData = dataToExtend.find(
        (row) => row.scenario_id == entity.id,
      );

      const metArea = +(extensionData?.current_pa ?? '0');
      const totalArea = +(extensionData?.total_area ?? '0');
      const targetPct = (extensionData?.target ?? 0) / 100;

      return {
        ...entity,
        target: extensionData?.target,
        onTarget: metArea >= totalArea * targetPct,
        met: metArea / totalArea,
        targetArea: (totalArea * (extensionData?.target ?? 0)) / 100,
      };
    });

    return [extended, entitiesAndCount[1]];
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenariosFeaturesView> {
    return {
      attributes: [
        'featureId',
        'tag',
        'name',
        'description',
        'target',
        'targetArea',
        'totalArea',
        'met',
        'metArea',
        'onTarget',
        'fpf',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  private withScenarioId = (
    scenario: ScenariosFeaturesView,
  ): scenario is ScenariosFeaturesView & { id: string } =>
    scenario.id !== null && scenario.id !== undefined;
}
