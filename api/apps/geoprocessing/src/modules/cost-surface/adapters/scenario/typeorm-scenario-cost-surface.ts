import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ScenarioCostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/scenario-cost-surface-persistence.port';
import { LinkCostSurfaceToScenarioMode } from '@marxan/artifact-cache/surface-cost-job-input';

@Injectable()
export class TypeormScenarioCostSurface
  implements ScenarioCostSurfacePersistencePort
{
  constructor(
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  async linkScenarioToCostSurface(
    scenarioId: string,
    costSurfaceId: string,
    mode: LinkCostSurfaceToScenarioMode,
  ): Promise<void> {
    await this.geoprocessingEntityManager.transaction(async (em) => {
      if (mode === 'update') {
        await em.query(
          `   UPDATE scenarios_pu_cost_data
                    SET cost = cost_surface."cost_value"
                    FROM
                    (
                        SELECT spd.id, cspd."cost" as cost_value
                        FROM scenarios_pu_data spd
                        LEFT JOIN cost_surface_pu_data cspd ON cspd.projects_pu_id = spd.project_pu_id
                        WHERE spd.scenario_id = $1 AND cspd.cost_surface_id = $2
                    ) cost_surface
                    WHERE scenarios_pu_cost_data.scenarios_pu_data_id = cost_surface.id`,
          [scenarioId, costSurfaceId],
        );
      } else if (mode === 'creation') {
        await em.query(
          `   INSERT INTO scenarios_pu_cost_data (scenarios_pu_data_id, cost)
                        SELECT spd.id as scenarios_pu_data_id, cspd."cost" as cost
                        FROM scenarios_pu_data spd
                        LEFT JOIN cost_surface_pu_data cspd ON cspd.projects_pu_id = spd.project_pu_id
                        WHERE spd.scenario_id = $1 AND cspd.cost_surface_id = $2`,
          [scenarioId, costSurfaceId],
        );
      }
    });
  }
}
