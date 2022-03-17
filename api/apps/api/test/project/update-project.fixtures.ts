import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ProjectCheckerFake } from '../utils/project-checker.service-fake';
import { HttpStatus } from '@nestjs/common';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const notIncludedUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const projectChecker = app.get(ProjectChecker) as ProjectCheckerFake;
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(app, token, {
      ...E2E_CONFIG.organizations.valid.minimal(),
      name: `Org name ${Date.now()}`,
    })
  ).data.id;
  let projectId: string;
  const updatedName = 'Test updated';
  const originalName = `Test`;

  return {
    GivenProjectWasCreated: async () => {
      projectId = (
        await ProjectsTestUtils.createProject(app, token, {
          name: originalName,
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
          name: updatedName,
        }),
    WhenProjectIsUpdatedWhileAnExportIsPending: async () => {
      projectChecker.addPendingExportForProject(projectId);

      return request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: updatedName,
        })
        .expect(HttpStatus.BAD_REQUEST);
    },
    WhenProjectIsUpdatedAsNotIncludedUser: async () =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${notIncludedUserToken}`)
        .send({
          name: updatedName,
        }),
    ThenWhenReadingProjectItHasNewData: async () => {
      const projectData = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectData.body.data.attributes.name).toBe(updatedName);
    },
    ThenWhenReadingProjectItHasTheOriginalData: async () => {
      const projectData = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectData.body.data.attributes.name).toBe(originalName);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
  };
};
