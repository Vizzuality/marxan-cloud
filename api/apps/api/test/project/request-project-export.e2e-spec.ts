import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { ProjectChecker } from '../../src/modules/projects/project-checker/project-checker.service';
import { ScenarioChecker } from '../../src/modules/scenarios/scenario-checker/scenario-checker.service';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectCheckerFake } from '../utils/project-checker.service-fake';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ScenarioCheckerFake } from '../utils/scenario-checker.service-fake';
import { FakeQueue } from '../utils/queues';
import { exportPieceQueueToken } from '../../src/modules/clone/infra/export/export-queue.provider';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 12_000);

afterEach(async () => {
  await fixtures?.cleanup();
});

test('should forbid export to unrelated users', async () => {
  await fixtures.GivenProjectWasCreated();

  const response = await fixtures.WhenUnrelatedUserRequestAnExport();

  fixtures.ThenForbiddenIsReturned(response);
});

test('rejects a request to export a project if this has a pending export', async () => {
  await fixtures.GivenProjectWasCreated();
  fixtures.GivenProjectHasAPendingExport();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenBadRequestIsReturned(response);
});

test('rejects a request to export a project if this has a scenario with a pending export', async () => {
  await fixtures.GivenProjectWasCreated();
  fixtures.GivenProjectHasAScenarioWithAPendingExport();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenBadRequestIsReturned(response);
});

test('rejects a request to export a project if this has a pending import', async () => {
  await fixtures.GivenProjectWasCreated();
  fixtures.GivenProjectHasAPendingImport();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenBadRequestIsReturned(response);
});

test('rejects a request to export a project if this has a scenario with a pending import', async () => {
  await fixtures.GivenProjectWasCreated();
  fixtures.GivenProjectHasAScenarioWithAPendingImport();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenBadRequestIsReturned(response);
});

test('rejects a request to export a project if this has a scenario with a pending blm calibration', async () => {
  await fixtures.GivenProjectWasCreated();
  fixtures.GivenProjectHasAScenarioWithAPendingBLMCalibration();

  const response = await fixtures.WhenOwnerUserRequestAnExport();

  fixtures.ThenBadRequestIsReturned(response);
});

test('rejects a request to export a project if this has a scenario with a pending marxan run', async () => {
  await fixtures.GivenProjectWasCreated();
  fixtures.GivenProjectHasAScenarioWithAPendingMarxanRun();

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
  const fakeScenarioChecker = app.get(ScenarioChecker) as ScenarioCheckerFake;
  const exportPieceQueue = app.get<FakeQueue>(exportPieceQueueToken);
  exportPieceQueue.getJobs.mockResolvedValue([]);

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const unrelatedUserToken = await GivenUserIsLoggedIn(app, 'dd');
  let projectId: string;
  let organizationId: string;
  let scenarioId: string;

  return {
    cleanup: async () => {
      fakeProjectChecker.clear();
      fakeScenarioChecker.clear();

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
      const project = await GivenProjectExists(app, ownerToken);
      projectId = project.projectId;
      organizationId = project.organizationId;
      const scenario = await GivenScenarioExists(app, projectId, ownerToken);
      scenarioId = scenario.id;
    },
    GivenProjectIsPublic: async () => {
      await publishedProjectsRepo.save([
        { id: projectId, name: 'name', description: 'description' },
      ]);
    },
    GivenProjectHasAPendingExport: () => {
      fakeProjectChecker.addPendingExportForProject(projectId);
    },
    GivenProjectHasAPendingImport: () => {
      fakeProjectChecker.addPendingImportForProject(projectId);
    },
    GivenProjectHasAScenarioWithAPendingExport: () => {
      fakeScenarioChecker.addPendingExportForScenario(scenarioId);
    },
    GivenProjectHasAScenarioWithAPendingImport: () => {
      fakeScenarioChecker.addPendingImportForScenario(scenarioId);
    },
    GivenProjectHasAScenarioWithAPendingBLMCalibration: () => {
      fakeScenarioChecker.addPendingBlmCalibrationForScenario(scenarioId);
    },
    GivenProjectHasAScenarioWithAPendingMarxanRun: () => {
      fakeScenarioChecker.addPendingMarxanRunForScenario(scenarioId);
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
