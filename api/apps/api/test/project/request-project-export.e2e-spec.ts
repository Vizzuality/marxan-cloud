import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
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
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ProjectChecker } from '../../src/modules/projects/project-checker/project-checker.service';
import { ProjectCheckerFake } from '../utils/project-checker.service-fake';

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

test('should return bad request error if the project is blocked', async () => {
  await fixtures.GivenProjectWasCreated();
  fixtures.GivenProjectHasAPendingBLMCalibration();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenBadRequestIsReturned(response);
});

test('should permit public project export for unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();
  await fixtures.GivenProjectIsPublic();

  const response = await fixtures.WhenUnrelatedUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

test('should permit export for owner users', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

test('should permit export for contributor users', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenContributorUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

test('should permit export for viewer users', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenViewerUserRequestAnExport();

  fixtures.ThenExportIsLaunched(response);
});

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const userProjectsRepo = app.get<Repository<UsersProjectsApiEntity>>(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const publishedProjectsRepo = app.get<Repository<PublishedProject>>(
    getRepositoryToken(PublishedProject),
  );
  const fakeProjectChecker = app.get(ProjectChecker) as ProjectCheckerFake;

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
    GivenProjectIsPublic: async () => {
      await publishedProjectsRepo.save([
        { id: projectId, name: 'name', description: 'description' },
      ]);
    },
    GivenProjectHasAPendingBLMCalibration: () => {
      fakeProjectChecker.addPendingBlmCalibrationForProject(projectId);
    },
    WhenUnrelatedUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${unrelatedUserToken}`),
    WhenOwnerUserRequestAnExport: () =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenContributorUserRequestAnExport: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: contributorUserId,
        roleName: ProjectRoles.project_contributor,
      });

      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${contributorToken}`);
    },
    WhenViewerUserRequestAnExport: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: viewerUserId,
        roleName: ProjectRoles.project_viewer,
      });

      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${viewerToken}`);
    },
    ThenExportIsLaunched: (response: request.Response) => {
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(403);
    },
    ThenBadRequestIsReturned: (response: request.Response) => {
      expect(response.status).toBe(400);
    },
  };
};
