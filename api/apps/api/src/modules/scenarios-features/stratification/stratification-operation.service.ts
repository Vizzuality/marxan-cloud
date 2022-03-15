import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { StratificationDataProvider } from './stratification-data.provider';
import { StratificationQuery } from './stratification-query.service';
import { FeatureConfigStratification } from '@marxan-api/modules/specification/domain';

@Injectable()
export class StratificationOperation {
  constructor(
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly stratificationDataProvider: StratificationDataProvider,
    private readonly stratificationQuery: StratificationQuery,
    private readonly events: ApiEventsService,
  ) {}

  async stratificate(data: {
    scenarioId: string;
    specificationId: string;
    input: FeatureConfigStratification;
  }) {
    await this.events.create({
      topic: data.scenarioId,
      kind: API_EVENT_KINDS.scenario__geofeatureStratification__submitted__v1__alpha1,
    });
    try {
      const featureId: { id: string }[] = await this.entityManager.query(
        `
          insert into features (feature_class_name, tag, creation_status)
          select f.feature_class_name || '/' || f2.feature_class_name,
                 'species',
                 'created'
          from features f
                 left join features f2 on f2.id = $2
          where f.id = $1 returning features.id;
        `,
        [data.input.baseFeatureId, data.input.againstFeatureId],
      );

      const { project, protectedAreaFilterByIds, planningAreaLocation } =
        await this.stratificationDataProvider.prepareData({
          scenarioId: data.scenarioId,
          input: data.input,
        });

      const { parameters, query } = this.stratificationQuery.prepareQuery(
        data.input,
        data.scenarioId,
        data.specificationId,
        planningAreaLocation,
        protectedAreaFilterByIds,
        project,
        featureId[0].id,
      );
      const ids: { id: string }[] = await this.geoEntityManager.query(
        query,
        parameters,
      );
      await this.events.create({
        topic: data.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureStratification__finished__v1__alpha1,
      });
      return ids;
    } catch (error) {
      await this.events.create({
        topic: data.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureStratification__failed__v1__alpha1,
      });
      throw error;
    }
  }
}
