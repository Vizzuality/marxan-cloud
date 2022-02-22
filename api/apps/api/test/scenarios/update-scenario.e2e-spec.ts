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
import { ScenarioChecker } from '../../src/modules/scenarios/scenario-checker/scenario-checker.service';
import { ScenarioCheckerFake } from '../utils/scenario-checker.service-fake';

let fixtures: FixtureType<typeof getFixtures>;

describe('update scenario', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  it(`should update an scenario with new data`, async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.WhenAcquiringLockForScenarioAsOwner(scenarioId);

    await fixtures
      .WhenUpdatingNameAndDescriptionOfAScenario(scenarioId)
      .ThatDoesNotHaveAnOngoingExport();

    await fixtures.ThenScenarioWasUpdatedSuccessfully(scenarioId);
  });

  it(`should update an scenario if another scenario has a pending marxan run`, async () => {
    const firstScenarioId = await fixtures.GivenScenarioWasCreated();
    const secondScenarioId = await fixtures.GivenScenarioWasCreated();

    await fixtures.WhenAScenarioHasAPendingMarxanRun(firstScenarioId);
    await fixtures.WhenAcquiringLockForScenarioAsOwner(secondScenarioId);

    await fixtures.WhenUpdatingAnScenario(secondScenarioId);

    await fixtures.ThenScenarioWasUpdatedSuccessfully(secondScenarioId);
  });

  it(`should not update an scenario if an export is running`, async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.WhenAcquiringLockForScenarioAsOwner(scenarioId);

    await fixtures
      .WhenUpdatingNameAndDescriptionOfAScenario(scenarioId)
      .ThatHasAnOngoingExport();

    await fixtures.ThenScenarioIsUnchanged(scenarioId);
  });

  it(`should not update an scenario if a project export is running`, async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.WhenAcquiringLockForScenarioAsOwner(scenarioId);

    await fixtures
      .WhenUpdatingNameAndDescriptionOfAScenario(scenarioId)
      .OfAProjectWithAnOngoingExport();

    await fixtures.ThenScenarioIsUnchanged(scenarioId);
  });
});

async function getFixtures() {
  const app = await bootstrapApplication();
  const ownerToken: string = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken: string = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken: string = await GivenUserIsLoggedIn(app, 'cc');
  const projectChecker = app.get(ProjectChecker) as ProjectCheckerFake;
  const scenarioChecker = app.get(ScenarioChecker) as ScenarioCheckerFake;

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

  const scenarios: string[] = [];
  const updatedName = 'Updated name';
  const updatedDescription = 'Updated description';
  const originalName = 'Test scenario';

  return {
    cleanup: async () => {
      projectChecker.clear();
      scenarioChecker.clear();

      await Promise.all(
        scenarios.map((id) =>
          ScenariosTestUtils.deleteScenario(app, ownerToken, id),
        ),
      );
      await ProjectsTestUtils.deleteProject(app, ownerToken, projectId);
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
      scenarios.push(result.data.id);
      return result.data.id;
    },
    WhenAcquiringLockForScenarioAsOwner: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenAScenarioHasAPendingMarxanRun: async (scenarioId: string) => {
      scenarioChecker.addPendingMarxanRunForScenario(scenarioId);
    },
    WhenAcquiringLockForScenarioAsContributor: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenUpdatingAnScenario: async (scenarioId: string) => {
      await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenarioId}`)
        .send({ name: updatedName, description: updatedDescription })
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(HttpStatus.OK);
    },
    WhenUpdatingNameAndDescriptionOfAScenario: (scenarioId: string) => {
      return {
        ThatDoesNotHaveAnOngoingExport: async () => {
          await request(app.getHttpServer())
            .patch(`/api/v1/scenarios/${scenarioId}`)
            .send({ name: updatedName, description: updatedDescription })
            .set('Authorization', `Bearer ${ownerToken}`)
            .expect(HttpStatus.OK);
        },
        ThatHasAnOngoingExport: async () => {
          scenarioChecker.addPendingExportForScenario(scenarioId);
          await request(app.getHttpServer())
            .patch(`/api/v1/scenarios/${scenarioId}`)
            .send({ name: updatedName, description: updatedDescription })
            .set('Authorization', `Bearer ${ownerToken}`)
            .expect(HttpStatus.BAD_REQUEST);
        },
        OfAProjectWithAnOngoingExport: async () => {
          projectChecker.addPendingExportForProject(projectId);
          await request(app.getHttpServer())
            .patch(`/api/v1/scenarios/${scenarioId}`)
            .send({ name: updatedName, description: updatedDescription })
            .set('Authorization', `Bearer ${ownerToken}`)
            .expect(HttpStatus.BAD_REQUEST);
        },
      };
    },
    ThenScenarioWasUpdatedSuccessfully: async (scenarioId: string) => {
      const scenarioData = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(scenarioData.body.data.attributes.name).toEqual(updatedName);
      expect(scenarioData.body.data.attributes.description).toEqual(
        updatedDescription,
      );
    },
    ThenScenarioIsUnchanged: async (scenarioId: string) => {
      const scenarioData = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(scenarioData.body.data.attributes.name).toEqual(originalName);
    },
  };
}
