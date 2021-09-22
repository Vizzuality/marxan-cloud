import { bootstrapApplication } from '../utils/api-application';
import { GivenScenarioPuDataExists } from '../steps/given-scenario-pu-data-exists';
import { v4 } from 'uuid';
import { Repository } from 'typeorm';
import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenarioPlanningUnitsService } from '@marxan-api/modules/scenarios/planning-units/scenario-planning-units.service';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

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
  const repo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );
  const sut = app.get(ScenarioPlanningUnitsService);
  const scenarioId = v4();

  return {
    GivenScenarioPlanningUnitsExist: async () =>
      await GivenScenarioPuDataExists(repo, scenarioId),
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
      await repo.delete({
        scenarioId,
      });
      await app.close();
    },
  };
};
