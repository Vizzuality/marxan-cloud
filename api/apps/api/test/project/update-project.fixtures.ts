import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(app, token, {
      ...E2E_CONFIG.organizations.valid.minimal(),
      name: `Org name ${Date.now()}`,
    })
  ).data.id;
  let projectId: string;
  return {
    cleanup: async () => {
      await ProjectsTestUtils.deleteProject(app, token, projectId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        token,
        organizationId,
      );
      await app.close();
    },
    GivenProjectWasCreated: async () => {
      projectId = (
        await ProjectsTestUtils.createProject(app, token, {
          name: `Test`,
          organizationId,
          metadata: {},
        })
      ).data.id;
    },
    WhenProjectIsUpdated: async () =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test updated',
        }),
    ThenWhenReadingProjectItHasNewData: async () => {
      const projectData = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectData.body.data.attributes.name).toBe('Test updated');
    },
  };
};
