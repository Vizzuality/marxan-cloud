import { INestApplication } from '@nestjs/common';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {} from '@marxan-geoprocessing/modules/cost-surface/application/project-cost-surface.processor';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { CleanupTasksService } from '@marxan-geoprocessing/modules/cleanup-tasks/cleanup-tasks.service';
import { GivenProjectExists } from '../cloning/fixtures';
import { GivenProjectsPuExists } from '../../steps/given-projects-pu-exists';

export const getFixtures = async (app: INestApplication) => {
  const projectId = v4();
  const organizationId = v4();
  const costSurfaceId = v4();
  const danglingCostSurfaceId = v4();

  const geoEntityManager = app.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const apiEntityManager = app.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );

  const cleanupTasksService: CleanupTasksService = app.get(CleanupTasksService);

  return {
    GivenDanglingCostSurfaceDataExists: async (): Promise<void> => {
      await GivenProjectExists(apiEntityManager, projectId, organizationId);

      const projectPus = await GivenProjectsPuExists(
        geoEntityManager,
        projectId,
      );

      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('cost_surfaces')
        .values({
          id: costSurfaceId,
          project_id: projectId,
          name: 'cost surface',
          min: 1,
          max: 10,
        })
        .execute();

      await geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('cost_surface_pu_data')
        .values({
          costSurfaceId: costSurfaceId,
          projectsPuId: projectPus[0].id,
          cost: 1,
        })
        .execute();

      await geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('cost_surface_pu_data')
        .values({
          costSurfaceId: costSurfaceId,
          projectsPuId: projectPus[1].id,
          cost: 2,
        })
        .execute();

      await geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('cost_surface_pu_data')
        .values({
          costSurfaceId: danglingCostSurfaceId,
          projectsPuId: projectPus[2].id,
          cost: 1,
        })
        .execute();
    },
    WhenCleanupIsExecuted: async () => cleanupTasksService.handleCron(),

    ThenDanglingCostSurfaceDataIsRemoved: async () => {
      const danglingCostSurfaceData = await geoEntityManager.find(
        CostSurfacePuDataEntity,
        {
          where: {
            costSurfaceId: danglingCostSurfaceId,
          },
        },
      );

      expect(danglingCostSurfaceData.length).toEqual(0);

      const validCostSurfaceData = await geoEntityManager.find(
        CostSurfacePuDataEntity,
        {
          where: {
            costSurfaceId: costSurfaceId,
          },
        },
      );

      expect(validCostSurfaceData.length).toEqual(2);
    },

    cleanup: async () => {
      await geoEntityManager.query(`DELETE FROM cost_surface_pu_data`);
      await geoEntityManager.query(`DELETE FROM projects_pu`);
      await apiEntityManager.query(`DELETE FROM cost_surfaces`);
      await apiEntityManager.query(`DELETE FROM projects`);
      await apiEntityManager.query(`DELETE FROM organizations`);
    },
  };
};
