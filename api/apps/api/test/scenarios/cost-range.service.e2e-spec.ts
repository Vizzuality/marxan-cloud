import { CostRangeService } from '@marxan-api/modules/scenarios/cost-range-service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ScenariosPuCostDataGeo } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GivenScenarioAndProjectPuData } from '../../../geoprocessing/test/steps/given-scenario-pu-data-exists';
import { bootstrapApplication } from '../utils/api-application';
import {
  GivenCostSurfacePuDataExists,
  GivenProjectsPuExists,
} from '../../../geoprocessing/test/steps/given-projects-pu-exists';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { CostSurfaceModule } from '@marxan-api/modules/cost-surface/cost-surface.module';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { E2E_CONFIG } from '../e2e.config';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should return valid min/max while data available for cost surface', async () => {
  const rangeService = fixtures.getRangeService();
  const { projectId, costSurfaceId } =
    await fixtures.GivenProjectWithDefaultCostSurfaceExists();

  await fixtures.GivenCostDataForProjectExists(projectId, costSurfaceId);

  const range = await rangeService.getCostSurfaceRange(costSurfaceId);
  expect(range).toStrictEqual({ min: 1, max: 1 });
});

it('should update cost range', async () => {
  const { projectId, costSurfaceId } =
    await fixtures.GivenProjectWithDefaultCostSurfaceExists();

  await fixtures.GivenCostDataForProjectExists(projectId, costSurfaceId);
  await fixtures.WhenIUpdateTheRangeForAGivenCostSurface(costSurfaceId);
  await fixtures.ThenTheRangeIsUpdatedForTheGivenCostSurface(costSurfaceId);
});

async function getFixtures() {
  const projectId = v4();
  const anotherProjectId = v4();
  const scenarioId = v4();
  const anotherScenarioId = v4();
  const app = await bootstrapApplication([
    TypeOrmModule.forFeature(
      [ProjectsModule, CostSurfaceModule],
      DbConnections.default,
    ),
    TypeOrmModule.forFeature(
      [PlanningUnitsGeom, ProjectsPuEntity, ScenariosPuCostDataGeo],
      DbConnections.geoprocessingDB,
    ),
  ]);

  const apiEntityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.default),
  );
  const geoEntityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const scenarioPuCostRepo: Repository<ScenariosPuCostDataGeo> = app.get(
    getRepositoryToken(ScenariosPuCostDataGeo, DbConnections.geoprocessingDB),
  );

  return {
    async GivenCostDataInDbForMultipleScenarios() {
      const { rows: firstScenarioPuData } = await GivenScenarioAndProjectPuData(
        geoEntityManager,
        projectId,
        scenarioId,
        3,
      );
      const { rows: secondScenarioPuData } =
        await GivenScenarioAndProjectPuData(
          geoEntityManager,
          anotherProjectId,
          anotherScenarioId,
          3,
        );

      await scenarioPuCostRepo.save([
        scenarioPuCostRepo.create({
          scenariosPuDataId: firstScenarioPuData[0].id,
          cost: -1,
        }),
        scenarioPuCostRepo.create({
          scenariosPuDataId: secondScenarioPuData[0].id,
          cost: 5,
        }),
        scenarioPuCostRepo.create({
          scenariosPuDataId: firstScenarioPuData[1].id,
          cost: 634,
        }),
        scenarioPuCostRepo.create({
          scenariosPuDataId: secondScenarioPuData[1].id,
          cost: -5323,
        }),
        scenarioPuCostRepo.create({
          scenariosPuDataId: firstScenarioPuData[2].id,
          cost: 4,
        }),
        scenarioPuCostRepo.create({
          scenariosPuDataId: secondScenarioPuData[2].id,
          cost: 6,
        }),
      ]);
    },
    GivenProjectWithDefaultCostSurfaceExists: async () => {
      const projects = await apiEntityManager.getRepository(User).find({
        where: { email: E2E_CONFIG.users.basic.aa.email },
        relations: ['projects'],
      });
      const costSurface = await apiEntityManager
        .getRepository(CostSurface)
        .findOneOrFail({ where: { projectId: projects[0].projects[0].id } });
      return {
        projectId: projects[0].projects[0].id,
        costSurfaceId: costSurface.id,
      };
    },
    GivenCostDataForProjectExists: async (
      projectId: string,
      costSurfaceId: string,
    ): Promise<void> => {
      await GivenProjectsPuExists(geoEntityManager, projectId);
      await GivenCostSurfacePuDataExists(
        geoEntityManager,
        costSurfaceId,
        projectId,
      );
    },
    async WhenIUpdateTheRangeForAGivenCostSurface(costSurfaceId: string) {
      await this.getRangeService().updateCostSurfaceRange(costSurfaceId);
    },
    async ThenTheRangeIsUpdatedForTheGivenCostSurface(costSurfaceId: string) {
      const range =
        await this.getRangeService().getCostSurfaceRange(costSurfaceId);
      expect(range).toStrictEqual({ min: 0, max: 0 });
    },
    getRangeService(): CostRangeService {
      return app.get(CostRangeService);
    },
    getScenarioId(): string {
      return scenarioId;
    },
  };
}
