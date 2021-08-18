import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { CreateFeaturesCommand } from '../create-features.command';
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

  async split(command: CreateFeaturesCommand & { input: FeatureConfigSplit }) {
    await this.events.create({
      topic: command.scenarioId,
      kind: API_EVENT_KINDS.scenario__geofeatureSplit__submitted__v1__alpha1,
    });
    try {
      const {
        project,
        input,
        protectedAreaFilterByIds,
        planningAreaLocation,
      } = await this.splitDataProvider.prepareData({
        ...command,
        input: command.input,
      });

      const { parameters, query } = this.splitQuery.prepareQuery(
        input,
        command,
        planningAreaLocation,
        protectedAreaFilterByIds,
        project,
      );
      const ids: { id: string }[] = await this.geoEntityManager.query(
        query,
        parameters,
      );
      await this.events.create({
        topic: command.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureSplit__finished__v1__alpha1,
      });
      return ids;
    } catch (error) {
      await this.events.create({
        topic: command.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureSplit__failed__v1__alpha1,
      });
      throw error;
    }
  }
}
