import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 10_000);

afterEach(async () => {
  await fixtures?.cleanup();
});

test('should forbid export to unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenUnrelatedUserRequestAnExport();

  fixtures.ThenForbiddenIsReturned(response);
});

test('should permit export for owner users ', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

test('should permit export for contributor users ', async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.GivenContributorWasAddedToProject();
  const response = await fixtures.WhenContributorUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

test('should permit export for viewer users ', async () => {
  await fixtures.GivenProjectWasCreated();

  await fixtures.GivenViewerWasAddedToProject();
  const response = await fixtures.WhenViewerUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const userProjectsRepo = app.get<Repository<UsersProjectsApiEntity>>(
    getRepositoryToken(UsersProjectsApiEntity),
  );

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const unrelatedUserToken = await GivenUserIsLoggedIn(app, 'dd');
  let projectId: string;
  let organizationId: string;

  return {
    cleanup: async () => {
      const connection = app.get<Connection>(Connection);
      const exportRepo = connection.getRepository(ExportEntity);

      await exportRepo.delete({});
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
    GivenContributorWasAddedToProject: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: contributorUserId,
        roleName: ProjectRoles.project_contributor,
      });
    },
    GivenViewerWasAddedToProject: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: viewerUserId,
        roleName: ProjectRoles.project_viewer,
      });
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(403);
    },
    WhenUnrelatedUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${unrelatedUserToken}`),
    WhenOwnerUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenContributorUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenViewerUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${viewerToken}`),
    ThenExportIsLaunched: (response: request.Response) => {
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    },
  };
};
