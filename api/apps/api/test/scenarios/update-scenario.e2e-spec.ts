import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GivenProjectExists } from '../steps/given-project';
import { HttpStatus } from '@nestjs/common';
import { ProjectCheckerFake } from '../utils/project-checker.service-fake';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';

let fixtures: FixtureType<typeof getFixtures>;

describe('update scenario', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  it(`should update an scenario with new data`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.WhenAcquiringLockForScenarioAsOwner();

    await fixtures
      .WhenUpdatingNameAndDescriptionOfAScenario()
      .ThatDoesNotHaveAnOngoingExport();

    await fixtures.ThenScenarioWasUpdatedSuccessfully();
  });

  it(`should not update an scenario if an export is running`, async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.WhenAcquiringLockForScenarioAsOwner();

    await fixtures
      .WhenUpdatingNameAndDescriptionOfAScenario()
      .ThatHasAnOngoingExport();

    await fixtures.ThenScenarioIsUnchanged();
  });
});

async function getFixtures() {
  const app = await bootstrapApplication();
  const ownerToken: string = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken: string = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken: string = await GivenUserIsLoggedIn(app, 'cc');
  const projectChecker = (await app.get(ProjectChecker)) as ProjectCheckerFake;
  const { projectId, organizationId } = await GivenProjectExists(
    app,
    ownerToken,
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
  const originalName = 'Test scenario';

  return {
    cleanup: async () => {
      projectChecker.clear();
      await ProjectsTestUtils.deleteProject(app, ownerToken, projectId);
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenarioId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        ownerToken,
        organizationId,
      );
      await app.close();
    },
    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(app, ownerToken, {
        name: originalName,
        type: ScenarioType.marxan,
        projectId,
      });
      scenarioId = result.data.id;
    },
    WhenAcquiringLockForScenarioAsOwner: async () =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenAcquiringLockForScenarioAsContributor: async () =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenUpdatingNameAndDescriptionOfAScenario: () => {
      return {
        ThatDoesNotHaveAnOngoingExport: async () => {
          await request(app.getHttpServer())
            .patch(`/api/v1/scenarios/${scenarioId}`)
            .send({ name: updatedName, description: updatedDescription })
            .set('Authorization', `Bearer ${ownerToken}`)
            .expect(HttpStatus.OK);
        },
        ThatHasAnOngoingExport: async () => {
          projectChecker.addPendingExportForProject(projectId);
          await request(app.getHttpServer())
            .patch(`/api/v1/scenarios/${scenarioId}`)
            .send({ name: updatedName, description: updatedDescription })
            .set('Authorization', `Bearer ${ownerToken}`)
            .expect(HttpStatus.BAD_REQUEST);
        },
      };
    },
    ThenScenarioWasUpdatedSuccessfully: async () => {
      const scenarioData = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(scenarioData.body.data.attributes.name).toEqual(updatedName);
      expect(scenarioData.body.data.attributes.description).toEqual(
        updatedDescription,
      );
    },
    ThenScenarioIsUnchanged: async () => {
      const scenarioData = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(scenarioData.body.data.attributes.name).toEqual(originalName);
    },
  };
}
