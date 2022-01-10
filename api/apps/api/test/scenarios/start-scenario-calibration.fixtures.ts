import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GivenProjectExists } from '../steps/given-project';
import { ProjectChecker } from '@marxan-api/modules/scenarios/project-checker/project-checker.service';
import { ProjectCheckerFake } from '../utils/project-checker.service-fake';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const projectChecker = (await app.get(ProjectChecker)) as ProjectCheckerFake;

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
  const updatedRange = [1, 50];

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
    WhenScenarioCalibrationIsLaunchedItShouldNotFail: () => ({
      WithRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            range: updatedRange,
          })
          .expect(HttpStatus.CREATED),
      WithoutRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${token}`)
          .expect(HttpStatus.CREATED),
    }),
    ThenWhenReadingProjectCalibrationItHasTheNewRange: async () => {
      const projectData = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/calibration`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectData.body.range).toEqual(updatedRange);
    },
    ThenShouldFailWhenStartingAnScenarioCalibrationWithA: () => {
      return {
        RangeWithNegativeNumbers: async () => {
          const response = await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [-1, -50],
            });
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        },
        RangeWithAMinGreaterThanMax: async () => {
          const response = await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [50, 1],
            });
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        },
        RangeWithValuesThatAreNotNumbers: async () => {
          const response = await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [1, '50'],
            });

          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        },
        RunningExport: async () => {
          projectChecker.addPendingExportForProject(projectId);
          const response = await request(app.getHttpServer())
            .post(`/api/v1/scenarios/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [1, 50],
            });

          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        },
      };
    },
  };
};
