import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

test('should forbid downloads to non owner users', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenNonOwnerUserRequestAnExport();

  fixtures.ThenForbiddenIsReturned(response);
});

test('should permit downloading exports for owner users ', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const notIncludedUserToken = await GivenUserIsLoggedIn(app, 'bb');
  let projectId: string;
  let organizationId: string;

  return {
    cleanup: async () => {
      await ProjectsTestUtils.deleteProject(app, ownerToken, projectId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        ownerToken,
        organizationId,
      );
      await app.close();
    },
    GivenProjectWasCreated: async () => {
      const result = await GivenProjectExists(app, ownerToken);
      projectId = result.projectId;
      organizationId = result.organizationId;
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(403);
    },
    WhenNonOwnerUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${notIncludedUserToken}`),
    WhenOwnerUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`),
    ThenExportIsLaunched: (response: request.Response) => {
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    },
  };
};
