import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FiltersSpecification } from 'nestjs-base-service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';

import { ScenariosFeaturesView } from './entities/scenarios-features.view.api.entity';
import { AppInfoDTO } from '../../dto/info.dto';
import {
  RemoteScenarioFeaturesData,
  remoteScenarioFeaturesDataViewName,
} from './entities/remote-scenario-features-data.geo.entity';
import { remoteConnectionName } from './entities/remote-connection-name';

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
    super(features, remoteScenarioFeaturesDataViewName);
  }

  setFilters(
    query: SelectQueryBuilder<ScenariosFeaturesView>,
    filters?: FiltersSpecification['filter'],
  ): SelectQueryBuilder<ScenariosFeaturesView> {
    return query.andWhere(`${this.alias}.id = :scenarioId`, {
      scenarioId: filters?.scenarioId,
    });
  }

  async extendFindAllResults(
    entitiesAndCount: [any[], number],
  ): Promise<[any[], number]> {
    const entities = entitiesAndCount[0] as ScenariosFeaturesView[];
    const scenarioIds = entities
      .filter(this.#withScenarioId)
      .map((sfv) => sfv.id);

    const dataToExtend =
      scenarioIds.length === 0
        ? []
        : await this.remoteFeatures.find({
            where: {
              scenario_id: In(scenarioIds),
            },
          });

    return [this.#injectMatching(entities, dataToExtend), entitiesAndCount[1]];
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenariosFeaturesView> {
    return {
      attributes: [
        'featureid',
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

  #injectMatching = (
    bases: ScenariosFeaturesView[],
    extensions: RemoteScenarioFeaturesData[],
  ): ScenariosFeaturesView[] =>
    bases.map((entity) =>
      this.#injectNonGeo(
        entity,
        extensions.find((row) => row.id == entity.featureid),
      ),
    );

  #injectNonGeo = (
    base: ScenariosFeaturesView,
    assign?: RemoteScenarioFeaturesData,
  ): ScenariosFeaturesView => {
    const metArea = +(assign?.current_pa ?? '0');
    const totalArea = +(assign?.total_area ?? '0');
    const targetPct = (assign?.target ?? 0) / 100;

    return {
      ...base,
      target: +(assign?.target ?? 0).toFixed(2),
      onTarget: metArea >= totalArea * targetPct,
      met: +((metArea / totalArea) * 100).toFixed(2),
      targetArea: (totalArea * (assign?.target ?? 0)) / 100,
    };
  };

  #withScenarioId = (
    scenario: ScenariosFeaturesView,
  ): scenario is ScenariosFeaturesView & { id: string } =>
    scenario.id !== null && scenario.id !== undefined;
}
