import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { defaultBlmRange } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectCheckerFake } from '../utils/project-checker.service-fake';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const projectChecker = (await app.get(ProjectChecker)) as ProjectCheckerFake;

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const projectViewerRole = ProjectRoles.project_viewer;
  const projectContributorRole = ProjectRoles.project_contributor;

  const { projectId } = await GivenProjectExists(
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

  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );

  await userProjectsRepo.save({
    projectId,
    roleName: projectContributorRole,
    userId: contributorUserId,
  });
  await userProjectsRepo.save({
    projectId,
    roleName: projectViewerRole,
    userId: viewerUserId,
  });

  await ProjectsTestUtils.generateBlmValues(app, projectId);
  let scenarioId: string;
  const updatedRange = [1, 50];
  const defaultRange = defaultBlmRange;

  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

  return {
    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(app, ownerToken, {
        name: `Test scenario`,
        type: ScenarioType.marxan,
        projectId,
      });
      scenarioId = result.data.id;
    },
    GivenContributorWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),
    GivenViewerWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      }),
    WhenScenarioCalibrationIsLaunchedAsOwner: () => ({
      WithRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            range: updatedRange,
            config: { baseUrl: 'example/png', cookie: 'randomCookie' },
          }),
      WithoutRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${ownerToken}`),
    }),
    WhenScenarioCalibrationIsLaunchedAsContributor: () => ({
      WithRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${contributorToken}`)
          .send({
            range: updatedRange,
            config: { baseUrl: 'example/png', cookie: 'randomCookie' },
          }),
      WithoutRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${contributorToken}`),
    }),
    WhenScenarioCalibrationIsLaunchedAsViewer: () => ({
      WithRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .send({
            range: updatedRange,
            config: { baseUrl: 'example/png', cookie: 'randomCookie' },
          }),
      WithoutRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${viewerToken}`),
    }),
    WhenReadingProjectCalibrationAsOwner: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/calibration`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenReadingProjectCalibrationAsContributor: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/calibration`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenReadingProjectCalibrationAsViewer: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/calibration`)
        .set('Authorization', `Bearer ${viewerToken}`),
    WhenStartingAnScenarioCalibrationAsOwnerWithA: () => {
      return {
        RangeWithNegativeNumbers: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
              range: [-1, -50],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RangeWithAMinGreaterThanMax: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
              range: [50, 1],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RangeWithValuesThatAreNotNumbers: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
              range: [1, '50'],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RunningExport: async () => {
          projectChecker.addPendingExportForProject(projectId);
          return request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
              range: [1, 50],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            });
        },
      };
    },
    WhenStartingAnScenarioCalibrationAsContributorWithA: () => {
      return {
        RangeWithNegativeNumbers: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${contributorToken}`)
            .send({
              range: [-1, -50],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RangeWithAMinGreaterThanMax: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${contributorToken}`)
            .send({
              range: [50, 1],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RangeWithValuesThatAreNotNumbers: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${contributorToken}`)
            .send({
              range: [1, '50'],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RunningExport: async () => {
          projectChecker.addPendingExportForProject(projectId);
          return request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${contributorToken}`)
            .send({
              range: [1, 50],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            });
        },
      };
    },
    WhenStartingAnScenarioCalibrationAsViewerWithA: () => {
      return {
        RangeWithNegativeNumbers: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({
              range: [-1, -50],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RangeWithAMinGreaterThanMax: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({
              range: [50, 1],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RangeWithValuesThatAreNotNumbers: async () =>
          await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({
              range: [1, '50'],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            }),
        RunningExport: async () => {
          projectChecker.addPendingExportForProject(projectId);
          return request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({
              range: [1, 50],
              config: { baseUrl: 'example/png', cookie: 'randomCookie' },
            });
        },
      };
    },
    ThenScenarioCalibrationIsCreated: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.CREATED);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    },
    ThenBadRequestIsReturned: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    },
    ThenItHasNoUpdatedRange: (response: request.Response) => {
      expect(response.body.range).toEqual(defaultRange);
    },
  };
};
