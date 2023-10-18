import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { chunk } from 'lodash';
import { EntityManager } from 'typeorm';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ScenarioCostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/scenario-cost-surface-persistence.port';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';

@Injectable()
export class TypeormScenarioCostSurface
  implements ScenarioCostSurfacePersistencePort {
  constructor(
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  async linkScenarioToCostSurface(
    scenarioId: string,
    costSurfaceId: string,
  ): Promise<void> {
    await this.geoprocessingEntityManager.transaction(async (em) => {
      const costsForScenarioPus: {
        scenariosPuId: string;
        cost: number;
      }[] = await em
        .createQueryBuilder()
        .select('spd.id', 'scenariosPuId')
        .addSelect('csp.cost', 'cost')
        .from(ScenariosPuPaDataGeo, 'spd')
        .leftJoin(
          CostSurfacePuDataEntity,
          'csp',
          'csp.projects_pu_id = spd.project_pu_id',
        )
        .where('spd.scenario_id = :scenarioId', { scenarioId })
        .andWhere('csp.cost_surface_id = :costSurfaceId', { costSurfaceId })
        .execute();

      await em.query(
        ` DELETE FROM scenarios_pu_cost_data spcd
                       USING scenarios_pu_data spd
                       WHERE spcd.scenarios_pu_data_id = spd.id and spd.scenario_id = $1`,
        [scenarioId],
      );

      await Promise.all(
        chunk(costsForScenarioPus, CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS).map(
          async (rows) => {
            await em.insert(
              ScenariosPuCostDataGeo,
              rows.map((row) => ({
                cost: row.cost,
                scenariosPuDataId: row.scenariosPuId,
              })),
            );
          },
        ),
      );
    });
  }
}
