import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { BlmCalibrationRunResultDto } from '../../src/modules/scenarios/dto/scenario-blm-calibration-results.dto';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;

  const { projectId, organizationId } = await GivenProjectExists(
    app,
    ownerToken,
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

  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

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
    GivenContributorWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),
    GivenViewerWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      }),
    WhenBlmCalibrationIsLaunchedAsOwner: async () =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/calibration`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          range: blmRange,
          config: { baseUrl: 'example/png', cookie: 'randomCookie' },
        })
        .expect(HttpStatus.CREATED),
    WhenContributorLaunchesCalibration: async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/calibration`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .send({
          range: blmRange,
        });
    },
    WhenViewerLaunchesCalibration: async () =>
      request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/calibration`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          range: blmRange,
          config: { baseUrl: 'example/png', cookie: 'randomCookie' },
        }),
    ThenCalibrationResultsShouldBeAvailable: async () => {
      const response: { body: BlmCalibrationRunResultDto[] } = await request(
        app.getHttpServer(),
      )
        .get(`/api/v1/scenarios/${scenarioId}/calibration`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const results = response.body;

      expect(results.length).toBeGreaterThan(0);

      results.forEach((result) => {
        expect(result.id).toBeDefined();
        expect(result.scenarioId).toBe(scenarioId);
        expect(result.cost).toBeGreaterThanOrEqual(0);
        expect(result.blmValue).toBeGreaterThanOrEqual(blmRange[0]);
        expect(result.blmValue).toBeLessThanOrEqual(blmRange[1]);
        expect(result.boundaryLength).toBeGreaterThanOrEqual(0);
      });
    },

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
  };
};
