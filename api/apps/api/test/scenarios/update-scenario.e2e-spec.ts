import { FixtureType } from '@marxan/utils/tests/fixture-type';
import {
  bootstrapApplication,
  ProjectCheckerFake,
} from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GivenProjectExists } from '../steps/given-project';
import { HttpStatus } from '@nestjs/common';
import { ProjectChecker } from '@marxan-api/modules/scenarios/project-checker.service';

let fixtures: FixtureType<typeof getFixtures>;

describe('update scenario', () => {
  beforeEach(async () => {
    console.error = () => {};
    fixtures = await getFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  it(`should update an scenario with new data`, async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures.WhenUpdatingNameAndDescriptionFromAnScenario();

    await fixtures.ThenWhenReadingTheScenarioDataItIsUpdated();
  });
});

async function getFixtures() {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const projectChecker = (await app.get(ProjectChecker)) as ProjectCheckerFake;
  const { projectId, organizationId } = await GivenProjectExists(
    app,
    token,
    {
      countryCode: 'AGO',
      name: `Project name ${Date.now()}`,
    },
    {
      name: `Org name ${Date.now()}`,
    },
  );

  await ProjectsTestUtils.generateBlmValues(app, projectId);
  let scenarioId: string;
  const updatedName = 'Updated name';
  const updatedDescription = 'Updated description';

  return {
    cleanup: async () => {
      await ProjectsTestUtils.deleteProject(app, token, projectId);
      await ScenariosTestUtils.deleteScenario(app, token, scenarioId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        token,
        organizationId,
      );
      await app.close();
    },
    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(app, token, {
        name: `Test scenario`,
        type: ScenarioType.marxan,
        projectId,
      });
      scenarioId = result.data.id;
    },
    WhenUpdatingNameAndDescriptionFromAnScenario: async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenarioId}`)
        .send({ name: updatedName, description: updatedDescription })
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);
    },
    ThenWhenReadingTheScenarioDataItIsUpdated: async () => {
      const scenarioData = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(scenarioData.body.data.attributes.name).toEqual(updatedName);
      expect(scenarioData.body.data.attributes.description).toEqual(
        updatedDescription,
      );
    },
  };
}
