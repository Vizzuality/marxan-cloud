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
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GivenScenarioPuData } from '../../../geoprocessing/test/steps/given-scenario-pu-data-exists';
import { bootstrapApplication } from '../utils/api-application';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

it(`should return defaults when no data`, async () => {
  // given
  const scenarioId = fixtures.getScenarioId();
  const rangeService = fixtures.getRangeService();
  // and no data
  // when
  const range = await rangeService.getRange(scenarioId);
  // then
  expect(range).toStrictEqual({
    min: 1,
    max: 1,
  });
});

it(`should return valid min/max while data available`, async () => {
  // given
  const scenarioId = fixtures.getScenarioId();
  const rangeService = fixtures.getRangeService();
  // and
  await fixtures.GivenCostDataInDbForMultipleScenarios();
  // when
  const range = await rangeService.getRange(scenarioId);
  // then
  expect(range).toStrictEqual({
    min: -1,
    max: 634,
  });
});

async function getFixtures() {
  const projectId = v4();
  const anotherProjectId = v4();
  const scenarioId = v4();
  const anotherScenarioId = v4();
  const app = await bootstrapApplication([
    TypeOrmModule.forFeature(
      [PlanningUnitsGeom, ProjectsPuEntity, ScenariosPuCostDataGeo],
      DbConnections.geoprocessingDB,
    ),
  ]);
  const entityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const projectsPuRepo: Repository<ProjectsPuEntity> = app.get(
    getRepositoryToken(ProjectsPuEntity, DbConnections.geoprocessingDB),
  );
  const geomsRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );
  const scenarioPuCostRepo: Repository<ScenariosPuCostDataGeo> = app.get(
    getRepositoryToken(ScenariosPuCostDataGeo, DbConnections.geoprocessingDB),
  );

  return {
    async GivenCostDataInDbForMultipleScenarios() {
      const { rows: firstScenarioPuData } = await GivenScenarioPuData(
        entityManager,
        projectId,
        scenarioId,
        3,
      );
      const { rows: secondScenarioPuData } = await GivenScenarioPuData(
        entityManager,
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
    async cleanup() {
      const projectPus = await projectsPuRepo.find({ projectId });
      await geomsRepo.delete({ id: In(projectPus.map((pu) => pu.geomId)) });
    },
    getRangeService(): CostRangeService {
      return app.get(CostRangeService);
    },
    getScenarioId(): string {
      return scenarioId;
    },
  };
}
