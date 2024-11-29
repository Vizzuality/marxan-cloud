import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { SplitDataProvider } from './split-data.provider';
import { SplitQuery } from './split-query.service';
import { SplitCreateFeatures } from './split-create-features.service';
import { ComputeArea } from '../compute-area.service';

@Injectable()
export class SplitOperation {
  constructor(
    private readonly splitCreateFeatures: SplitCreateFeatures,
    private readonly splitDataProvider: SplitDataProvider,
    private readonly splitQuery: SplitQuery,
    private readonly computeArea: ComputeArea,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    private readonly events: ApiEventsService,
  ) {}

  async split(data: {
    scenarioId: string;
    specificationId: string;
    input: FeatureConfigSplit;
  }) {
    await this.events.create({
      topic: data.scenarioId,
      kind: API_EVENT_KINDS.scenario__geofeatureSplit__submitted__v1__alpha1,
    });
    try {
      const { project, protectedAreaFilterByIds, planningAreaLocation } =
        await this.splitDataProvider.prepareData({
          scenarioId: data.scenarioId,
        });

      const singleSplitFeaturesWithId =
        await this.splitCreateFeatures.createSplitFeatures(
          data.input,
          project.id,
        );

      const scenarioFeaturePreparationIds: { id: string }[] = [];

      for (const singleSplitFeatureWithId of singleSplitFeaturesWithId) {
        const { parameters, query } = this.splitQuery.prepareQuery(
          singleSplitFeatureWithId,
          data.scenarioId,
          data.specificationId,
          planningAreaLocation,
          protectedAreaFilterByIds,
          project,
        );
        const scenarioFeaturePreparationIdsForFeature: {
          id: string;
          features_data_id: string;
        }[] = await this.geoEntityManager.query(query, parameters);
        scenarioFeaturePreparationIds.push(
          ...scenarioFeaturePreparationIdsForFeature,
        );
        const featureDataStableIds = await this.geoEntityManager.query(
          'select stable_id from features_data where id = any($1)',
          [
            scenarioFeaturePreparationIdsForFeature.map(
              (i) => i.features_data_id,
            ),
          ],
        );
        await this.splitCreateFeatures.setFeatureDataStableIdsForFeature(
          singleSplitFeatureWithId.id,
          featureDataStableIds,
        );
      }

      await this.computeAmountPerFeature(
        singleSplitFeaturesWithId.map(({ id }) => id),
        project.id,
        data.scenarioId,
      );
      await this.events.create({
        topic: data.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureSplit__finished__v1__alpha1,
      });
      return scenarioFeaturePreparationIds;
    } catch (error) {
      await this.events.create({
        topic: data.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureSplit__failed__v1__alpha1,
      });
      throw error;
    }
  }

  private async computeAmountPerFeature(
    featuresIds: string[],
    projectId: string,
    scenarioId: string,
  ) {
    return Promise.all(
      featuresIds.map((featureId) =>
        this.computeArea.computeAreaPerPlanningUnitOfFeature(
          projectId,
          scenarioId,
          featureId,
        ),
      ),
    );
  }
}
