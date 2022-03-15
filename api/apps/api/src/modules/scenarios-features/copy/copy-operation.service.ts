import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { FeatureConfigCopy } from '@marxan-api/modules/specification';
import { CopyQuery } from './copy-query.service';
import { CopyDataProvider } from './copy-data-provider.service';

@Injectable()
export class CopyOperation {
  constructor(
    private readonly copyQuery: CopyQuery,
    private readonly copyDataProvider: CopyDataProvider,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    private readonly events: ApiEventsService,
  ) {}

  async copy(data: {
    scenarioId: string;
    specificationId: string;
    input: FeatureConfigCopy;
  }): Promise<{ id: string }[]> {
    await this.events.create({
      topic: data.scenarioId,
      kind: API_EVENT_KINDS.scenario__geofeatureCopy__submitted__v1__alpha1,
    });
    try {
      const { project, protectedAreaFilterByIds, planningAreaLocation } =
        await this.copyDataProvider.prepareData(data);
      const { parameters, query } = this.copyQuery.prepareStatement(
        data,
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
        kind: API_EVENT_KINDS.scenario__geofeatureCopy__finished__v1__alpha1,
      });
      return ids;
    } catch (error) {
      await this.events.create({
        topic: data.scenarioId,
        kind: API_EVENT_KINDS.scenario__geofeatureCopy__failed__v1__alpha1,
      });
      throw error;
    }
  }
}
