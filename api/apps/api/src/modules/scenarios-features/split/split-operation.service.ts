import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { SplitDataProvider } from './split-data.provider';
import { SplitQuery } from './split-query.service';

@Injectable()
export class SplitOperation {
  constructor(
    private readonly splitDataProvider: SplitDataProvider,
    private readonly splitQuery: SplitQuery,
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
      const {
        project,
        protectedAreaFilterByIds,
        planningAreaLocation,
      } = await this.splitDataProvider.prepareData({
        scenarioId: data.scenarioId,
        input: data.input,
      });

      const { parameters, query } = this.splitQuery.prepareQuery(
        data.input,
        data.scenarioId,
        data.specificationId,
        planningAreaLocation,
        protectedAreaFilterByIds,
        project,
      );
      const ids: { id: string }[] = await this.geoEntityManager.query(
        query,
        parameters,
      );
      await this.events.create({
        topic: data.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureSplit__finished__v1__alpha1,
      });
      return ids;
    } catch (error) {
      await this.events.create({
        topic: data.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureSplit__failed__v1__alpha1,
      });
      throw error;
    }
  }
}
