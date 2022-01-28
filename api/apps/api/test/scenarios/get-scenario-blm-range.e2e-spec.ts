import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import * as request from 'supertest';

let fixtures: FixtureType<typeof getFixtures>;

describe('get-scenario-blm-calibration-results', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 100000);

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  it.todo(
    'should retrieve the default BLM range that it is the same as the project range',
  );
  it.todo('should retrieve the updated BLM range');
  it.todo('should block retrieving the BLM range for non authenticated users');
});

const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
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
  const blmRange = [0, 100];

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
    WhenAskingForBlmRangeForScenario: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/blm/range`)
        .set('Authorization', `Bearer ${token}`),
    ThenBlmRangeShouldBeDefined: async (response: request.Response) => {
      expect(response.body.range).toBeDefined();
      expect(response.body.range).toHaveLength(2);
      expect(response.body.range).toEqual(blmRange);
    },
  };
};
