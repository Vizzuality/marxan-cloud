import {
  JSONAPISerializerConfig,
  PaginationMeta,
} from '@marxan-api/utils/app-base.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  GeoFeatureSetSpecification,
  SpecForGeofeature,
  SpecForGeoFeatureWithGeoprocessing,
  SpecForPlainGeoFeature,
} from './dto/geo-feature-set-specification.dto';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { GeoFeatureSetResult } from './geo-feature-set.api.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Scenario } from '../scenarios/scenario.api.entity';
import { EntityManager, Repository } from 'typeorm';
import { GeoFeaturePropertySetService } from './geo-feature-property-sets.service';
import { ScenarioFeaturesData } from '@marxan/features';
import { flattenDeep } from 'lodash';
import { GeoprocessingOpSplitV1 } from './types/geo-feature.geoprocessing-operations.type';
import { RemoteFeaturesData } from '../scenarios-features/entities/remote-features-data.geo.entity';

export const EntityManagerToken = Symbol();

export const MarxanFeaturesMetadata = {
  defaults: {
    fpf: 1,
  },
};

@Injectable()
export class GeoFeatureSetService {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    private readonly geoFeaturePropertySetService: GeoFeaturePropertySetService,
    @Inject(EntityManagerToken)
    private readonly entityManager: EntityManager,
  ) {}

  get serializerConfig(): JSONAPISerializerConfig<GeoFeatureSetSpecification> {
    return {
      attributes: ['status', 'features'],
      keyForAttribute: 'camelCase',
    };
  }

  async serialize(
    entities:
      | Partial<GeoFeatureSetSpecification>
      | undefined
      | (Partial<GeoFeatureSetSpecification> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<GeoFeatureSetResult> {
    const serializer = new JSONAPISerializer.Serializer('GeoFeatureSets', {
      ...this.serializerConfig,
      meta: paginationMeta,
    });

    return serializer.serialize(entities);
  }

  /**
   * Create or replace the set of features linked to a scenario.
   */
  async createOrReplaceFeatureSet(
    id: string,
    dto: GeoFeatureSetSpecification,
  ): Promise<GeoFeatureSetSpecification | undefined> {
    const scenario = await this.scenarioRepository.findOneOrFail(id);
    await this.scenarioRepository.update(id, { featureSet: dto });
    // @todo: move to async job - this was just for simple tests
    await this.createFeaturesForScenario(id, dto.features);
    return await this.geoFeaturePropertySetService.extendGeoFeatureProcessingSpecification(
      dto,
      scenario,
    );
  }

  /**
   * Given a specification for features to be linked to a scenario, compute
   * features defined via geoprocessing operations and link plain features
   * and features from geoprocessing to the scenario.
   */
  async createFeaturesForScenario(
    scenarioId: string,
    featureSpecification: SpecForGeofeature[],
  ): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const repository = transactionalEntityManager.getRepository(
        ScenarioFeaturesData,
      );
      await repository.delete({ scenarioId });
      // First process features which can be used as they are (plain)
      await this.createPlainFeaturesForScenario(
        transactionalEntityManager,
        scenarioId,
        featureSpecification,
      );
      // Then process features from geoprocessing operations of kind `split/v1`
      // TODO
      // Then process features from geoprocessing operations of kind `stratification/v1`
      // TODO
    });
  }

  /**
   * Given a specification for features to be linked to a scenario, select plain
   * features (i.e. no geoprocessing required) and link them to the scenario as
   * part of an ongoing db transaction.
   *
   * @todo fix typing
   */
  async createPlainFeaturesForScenario(
    transactionalEntityManager: EntityManager,
    scenarioId: string,
    featureSpecification: SpecForGeofeature[],
  ): Promise<
    {
      scenarioId: string;
      featuresDataId: string;
      fpf?: number | undefined;
      prop?: number | undefined;
    }[][]
  > {
    const repository = transactionalEntityManager.getRepository(
      ScenarioFeaturesData,
    );
    const scenarioFeaturesData = Promise.all(
      featureSpecification
        .filter(
          (feature): feature is SpecForPlainGeoFeature =>
            feature.kind === 'plain',
        )
        .map(async (feature) => {
          const featuresDataRepo = transactionalEntityManager.getRepository(
            RemoteFeaturesData,
          );
          const featuresData = await featuresDataRepo
            .find({ featureId: feature.featureId })
            .then((result) =>
              result.map((fd) => ({
                scenarioId,
                featuresDataId: fd.id,
                fpf:
                  feature.marxanSettings?.fpf ??
                  MarxanFeaturesMetadata.defaults.fpf,
                prop: feature.marxanSettings?.prop,
              })),
            );

          return repository.save(featuresData);
        }),
    );
    return scenarioFeaturesData;
  }

  /**
   * Given a specification for features to be linked to a scenario, select plain
   * features (i.e. no geoprocessing required) and link them to the scenario as
   * part of an ongoing db transaction.
   *
   * @todo fix typing
   */
  async createGeoprocessedFeaturesForScenarioWithSplitV1(
    transactionalEntityManager: EntityManager,
    scenarioId: string,
    featureSpecification: SpecForGeofeature[],
  ): Promise<any> {
    // ({
    //   scenarioId: string;
    //   featuresDataId: string;
    //   fpf: number;
    //   prop: number | undefined;
    // } & RemoteScenarioFeaturesData)[]
    const _repository = transactionalEntityManager.getRepository(
      ScenarioFeaturesData,
    );
    return Promise.all(
      featureSpecification
        .filter(
          (feature): feature is SpecForGeoFeatureWithGeoprocessing =>
            feature.kind === 'withGeoprocessing',
        )
        .map((feature) => {
          const splitOperations = flattenDeep(
            feature.geoprocessingOperations
              ?.filter(
                (operation): operation is GeoprocessingOpSplitV1 =>
                  operation.kind === 'split/v1',
              )
              .map((operation) =>
                operation.splits.map((split) => ({
                  featureId: feature.featureId,
                  splitByProperty: operation.splitByProperty,
                  value: split.value,
                  marxanSettings: split.marxanSettings,
                })),
              ),
          );

          Logger.debug(splitOperations);
          // return repository.save({
          //   scenarioId,
          //   featuresDataId: feature.featureId,
          //   fpf:
          //     feature.marxanSettings?.fpf ??
          //     MarxanFeaturesMetadata.defaults.fpf,
          //   prop: feature.marxanSettings?.prop,
          // });
        }),
    );
  }
}
