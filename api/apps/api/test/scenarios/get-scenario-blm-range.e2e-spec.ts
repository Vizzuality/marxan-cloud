import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';

let fixtures: FixtureType<typeof getFixtures>;

describe('get-scenario-blm-calibration-results', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(async () => {
    await fixtures.cleanup();
  });

  it('should retrieve the default BLM range that it is the same as the project range', async () => {
    await fixtures.GivenScenarioWasCreated();

    const response = await fixtures
      .WhenAskingForBlmRangeForScenario()
      .WithTheOwnerUser();

    await fixtures
      .ThenBlmRangeShouldBeRetrieved(response)
      .AndBeEqualToItsProjectBlm();
  });

  it('should retrieve the updated BLM range', async () => {
    await fixtures.GivenScenarioWasCreated();

    await fixtures.GivenScenarioBlmWasUpdated();

    const response = await fixtures
      .WhenAskingForBlmRangeForScenario()
      .WithTheOwnerUser();

    await fixtures
      .ThenBlmRangeShouldBeRetrieved(response)
      .AndBeUpdatedWithTheNewRange();
  });

  it('should block retrieving the BLM range for non allowed users', async () => {
    await fixtures.GivenScenarioWasCreated();

    const response = await fixtures
      .WhenAskingForBlmRangeForScenario()
      .WithANonViewerUser();

    await fixtures.ThenAForbiddenErrorShouldBeReturned(response);
  });

  // @debt To be refactored after PNG generation process is complete.
  it('should block retrieving the BLM range for non allowed users', async () => {
    await fixtures.GivenScenarioWasCreated();

    const response = await fixtures.WhenGettingPngScreenshotOfBlmValues();

    fixtures.ThenAPngImageShouldBeReturned(response);
  });
});

const getFixtures = async () => {
  const app = await bootstrapApplication();

  const anotherToken = await GivenUserIsLoggedIn(app, 'aa');
  const ownerToken = await GivenUserIsLoggedIn(app, 'bb');

  const { projectId, organizationId } = await GivenProjectExists(
    app,
    ownerToken,
    {
      countryId: 'AGO',
      name: `Project name ${Date.now()}`,
    },
    {
      name: `Org name ${Date.now()}`,
    },
  );

  await ProjectsTestUtils.generateBlmValues(app, projectId);
  let scenarioId: string;
  const updatedBlmRange = [1, 50];

  // @debt To be replaced with proper values from BLM
  // run after process is finished.
  const mockBlmValues = 25;

  return {
    cleanup: async () => {
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
        name: `Test scenario`,
        type: ScenarioType.marxan,
        projectId,
      });

      scenarioId = result.data.id;
    },
    GivenScenarioBlmWasUpdated: async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/calibration`)
        .send({
          range: updatedBlmRange,
          config: { baseUrl: 'example/png', cookie: 'randomCookie' },
        })
        .set('Authorization', `Bearer ${ownerToken}`);
    },
    WhenAskingForBlmRangeForScenario: () => {
      return {
        WithTheOwnerUser: async () => {
          return request(app.getHttpServer())
            .get(`/api/v1/scenarios/${scenarioId}/blm/range`)
            .set('Authorization', `Bearer ${ownerToken}`);
        },
        WithANonViewerUser: async () => {
          return request(app.getHttpServer())
            .get(`/api/v1/scenarios/${scenarioId}/blm/range`)
            .set('Authorization', `Bearer ${anotherToken}`);
        },
      };
    },
    ThenBlmRangeShouldBeRetrieved: (response: request.Response) => {
      expect(response.body.range).toBeDefined();
      expect(response.body.range).toHaveLength(2);

      return {
        AndBeEqualToItsProjectBlm: async () => {
          const projectBlm = await request(app.getHttpServer())
            .get(`/api/v1/projects/${projectId}/calibration`)
            .set('Authorization', `Bearer ${ownerToken}`);

          expect(response.body.range).toEqual(projectBlm.body.range);
        },
        AndBeUpdatedWithTheNewRange: async () => {
          expect(response.body.range).toEqual(updatedBlmRange);
        },
      };
    },
    ThenAForbiddenErrorShouldBeReturned: (response: request.Response) => {
      expect(response.body.errors[0].status).toBe(HttpStatus.FORBIDDEN);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.forbidden).toEqual(true);
    },
    // @debt To be refactored when process to store
    // and get blm screenshots from values is finished.
    WhenGettingPngScreenshotOfBlmValues: async () =>
      await request(app.getHttpServer())
        .get(
          `/api/v1/scenarios/${scenarioId}/calibration/maps/preview/${mockBlmValues}`,
        )
        .set('Authorization', `Bearer ${ownerToken}`),

    ThenAPngImageShouldBeReturned: (response: request.Response) => {
      expect(response.headers['content-type']).toBe(`image/png`);
    },
  };
};
