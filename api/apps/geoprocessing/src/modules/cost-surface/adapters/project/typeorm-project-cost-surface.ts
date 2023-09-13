import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { chunk } from 'lodash';
import { EntityManager } from 'typeorm';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectCostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/project-cost-surface-persistence.port';

@Injectable()
export class TypeormProjectCostSurface
  implements ProjectCostSurfacePersistencePort {
  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  async save(values: CostSurfacePuDataEntity[]): Promise<void> {
    await this.geoprocessingEntityManager.transaction(async (em) => {
      await Promise.all(
        chunk(values, CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS).map(
          async (rows) => {
            await em.insert(
              CostSurfacePuDataEntity,
              rows.map((row) => ({
                cost: row.cost,
                puid: row.puid,
                costSurfaceId: row.costSurfaceId,
              })),
            );
          },
        ),
      );
    });
  }

  async generateInitialCostSurface(
    projectId: string,
    costSurfaceId: string,
  ): Promise<void> {
    /**
     * Beware: here we set PU cost after rounding PU area to the nearest square
     * km value. This is ok when we generate grids from a GADM area or from a
     * user-supplied planning area, as the frontend app only allows to specify
     * integer values for square km areas for grid generation in any case (the
     * API however would accept a float if used directly, however).
     *
     * Therefore, in the case of grids generated from user settings in the app,
     * the rounding applied here will lead to the expected result (taking into
     * account tiny discrepancies in actual PU areas generated by PostGIS,
     * depending on PU area, location on the Earth spheroid, extent of the
     * planning area, PostGIS version, etc.).
     *
     * When users do supply their own grid, instead, they may wish to keep
     * fractional differences in PU areas to be kept intact when setting initial
     * PU cost. In this case, we would need to differentiate whether a grid is
     * supplied by the user or generated by PostGIS.
     *
     * As we expect sub-square km precision to be rarely needed in general for
     * initial cost surfaces, we keep here the rounding by default, with the
     * caveat that if this precision needs to be added to the platform in the
     * future, we will need to differentiate between user-supplied or
     * programmatic origin of grids.
     *
     * In the meanwhile, users can upload custom cost surfaces after a project
     * has been created in order to override the rounded values in the initial
     * cost values set here.
     */
    await this.geoprocessingEntityManager.query(
      `
        INSERT INTO cost_surface_pu_data (puid, cost, cost_surface_id)
        SELECT ppu.id, round(pug.area / 1000000) as area, $2
        FROM projects_pu ppu
          INNER JOIN planning_units_geom pug ON pug.id = ppu.geom_id
        WHERE project_id = $1
      `,
      [projectId, costSurfaceId],
    );
  }

  /**
   * @description: Once the MIN and MAX values are known, we must update these for the relevant cost surface in the API DB.
   *
   * @todo: Move CostSurface API entity to libs for type safety
   */
  async updateCostSurfaceRange(costSurfaceId: string): Promise<void> {
    const { min, max } = await this.getCostSurfaceRange(costSurfaceId);
    await this.apiEntityManager
      .createQueryBuilder()
      .update('cost_surfaces')
      .set({ min, max })
      .where('id = :costSurfaceId', { costSurfaceId })
      .execute();
  }

  async getCostSurfaceRange(
    costSurfaceId: string,
  ): Promise<{ min: number; max: number }> {
    const { min, max } = (
      await this.geoprocessingEntityManager.query(
        `
        SELECT MIN(cspd.cost) as min, MAX(cspd.cost) as max
        FROM cost_surface_pu_data cspd
        WHERE cost_surface_id = $1;
      `,
        [costSurfaceId],
      )
    )[0];
    return { min: min ?? 1, max: max ?? 1 };
  }
}
