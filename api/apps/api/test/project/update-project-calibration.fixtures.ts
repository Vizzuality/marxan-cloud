import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { CommandBus } from '@nestjs/cqrs';
import { SetProjectBlm } from '@marxan-api/modules/projects/blm/set-project-blm';
import { HttpStatus } from '@nestjs/common';

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
  const updatedRange = [1, 50];
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
      const commandBus = app.get(CommandBus);
      const project = await ProjectsTestUtils.createProject(app, token, {
        planningUnitAreakm2: 1500,
        name: `Test`,
        organizationId,
      });
      projectId = project.data.id;
      await commandBus.execute(new SetProjectBlm(projectId));
    },
    WhenProjectCalibrationIsUpdated: async () =>
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/calibration`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          range: updatedRange,
        }),
    ThenWhenReadingProjectCalibrationItHasTheNewRange: async () => {
      const projectData = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/calibration`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectData.body.range).toEqual(updatedRange);
    },
    ThenShouldFailWhenUpdatingProjectCalibrationWithA: () => {
      return {
        RangeWithNegativeNumbers: async () => {
          await request(app.getHttpServer())
            .patch(`/api/v1/projects/${projectId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [-1, -50],
            })
            .expect(HttpStatus.BAD_REQUEST);
        },
        RangeWithAMinGreaterThanMax: async () => {
          await request(app.getHttpServer())
            .patch(`/api/v1/projects/${projectId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [50, 1],
            })
            .expect(HttpStatus.BAD_REQUEST);
        },
        RangeWithValuesThatAreNotNumbers: async () => {
          await request(app.getHttpServer())
            .patch(`/api/v1/projects/${projectId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [1, '50'],
            })
            .expect(HttpStatus.BAD_REQUEST);
        },
      };
    },
  };
};
