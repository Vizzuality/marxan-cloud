import { bootstrapApplication } from '../../utils/api-application';
import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../../utils/organizations.test.utils';
import { E2E_CONFIG } from '../../e2e.config';
import { ProjectsTestUtils } from '../../utils/projects.test.utils';
import * as request from 'supertest';
import { CqrsModule } from '@nestjs/cqrs';
import { EventBusTestUtils } from '../../utils/event-bus.test.utils';
import { ProjectDeleted } from '@marxan-api/modules/projects/events/project-deleted.event';

export const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const token = await GivenUserIsLoggedIn(app);
  const notIncludedUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(app, token, {
      ...E2E_CONFIG.organizations.valid.minimal(),
      name: `Org name ${Date.now()}`,
    })
  ).data.id;
  let projectId: string;
  return {
    GivenProjectWasCreated: async () => {
      projectId = (
        await ProjectsTestUtils.createProject(app, token, {
          name: `Test`,
          organizationId,
          metadata: {},
        })
      ).data.id;
    },
    WhenProjectIsDeleted: async () =>
      await request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`),
    WhenProjectIsDeletedAsNotIncludedUser: async () =>
      await request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${notIncludedUserToken}`),
    ThenProjectIsNotFound: async () => {
      const projectResponse = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectResponse.status).toEqual(404);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
    ThenProjectDeleteEventHasBeenSent: async () => {
      const event = await eventBusTestUtils.waitUntilEventIsPublished(
        ProjectDeleted,
      );

      expect(event).toMatchObject({
        projectId,
        scenarioIds: [],
        projectCustomFeaturesIds: [],
      });
    },
  };
};
