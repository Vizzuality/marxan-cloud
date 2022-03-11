import { ScenarioPlanningUnitsService } from '@marxan-api/modules/scenarios/planning-units/scenario-planning-units.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GivenScenarioPuDataExists } from '../../../geoprocessing/test/steps/given-scenario-pu-data-exists';
import { bootstrapApplication } from '../utils/api-application';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test(`resetting lock status`, async () => {
  await fixtures.GivenScenarioPlanningUnitsExist();
  await fixtures.WhenRequestingToResetLockStatus();
  await fixtures.ThenPlanningUnitsAreChangedToDefaultState();
});

const getFixtures = async () => {
  const app = await bootstrapApplication();
  const entityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const projectsPuRepo = entityManager.getRepository(ProjectsPuEntity);
  const geomsRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );
  const repo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );
  const sut = app.get(ScenarioPlanningUnitsService);
  const projectId = v4();
  const scenarioId = v4();

  return {
    GivenScenarioPlanningUnitsExist: () =>
      GivenScenarioPuDataExists(entityManager, projectId, scenarioId, {
        protectedByDefault: true,
      }),
    WhenRequestingToResetLockStatus: async () =>
      sut.resetLockStatus(scenarioId),
    ThenPlanningUnitsAreChangedToDefaultState: async () => {
      const lockStatuses = (
        await repo.find({
          where: {
            scenarioId,
          },
        })
      ).map((pu) => pu.lockStatus);
      expect(
        lockStatuses.every((status) => status === LockStatus.LockedIn),
      ).toBeTruthy();
    },
    cleanup: async () => {
      const projectPus = await projectsPuRepo.find({ projectId });
      await geomsRepo.delete({ id: In(projectPus.map((pu) => pu.geomId)) });
      await app.close();
    },
  };
};
