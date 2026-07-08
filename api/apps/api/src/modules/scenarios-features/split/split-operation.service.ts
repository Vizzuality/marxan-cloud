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
        // Link the split feature to the FULL key/value-matching subset of the
        // parent's features_data rows — not the bbox-filtered scenario-prep rows
        // SplitQuery returns. This matches how splits render (the full class) and
        // the legacy backport; amounts are planning-unit-bounded, so the broader
        // set is harmless. Value match mirrors SplitQuery's.
        const { baseFeatureId, splitByProperty, subset } =
          singleSplitFeatureWithId.singleSplitFeature;
        const featureDataStableIds = await this.geoEntityManager.query(
          `select fd.stable_id
             from feature_properties_kv fpkv
             join features_data fd on fd.id = fpkv.feature_data_id
            where fpkv.feature_id = $1
              and fpkv.key = $2
              and trim('"' from fpkv.value::text) = trim('"' from $3::text)`,
          [baseFeatureId, splitByProperty, subset?.value],
        );
        await this.splitCreateFeatures.setFeatureDataStableIdsForFeature(
          singleSplitFeatureWithId.id,
          featureDataStableIds,
        );

        // The child's own per-PU amounts must exist BEFORE the scenario-prep
        // insert: SplitQuery fills total_area/current_pa from them, so the
        // gap analysis reflects each split value's subset rather than the
        // parent's totals. ComputeArea reads the stable ids set above and is
        // idempotent (skips children that already have amounts).
        await this.computeArea.computeAreaPerPlanningUnitOfFeature(
          project.id,
          data.scenarioId,
          singleSplitFeatureWithId.id,
        );

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
      }

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
}
