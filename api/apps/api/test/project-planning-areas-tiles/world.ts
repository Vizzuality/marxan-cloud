import { Repository } from 'typeorm';
import { INestApplication, Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';

import { E2E_CONFIG } from '../e2e.config';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import {gunzip} from 'zlib';


import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { decodeMvt } from '@marxan/utils/geo/decode-mvt';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';

export const createWorld = async (app: INestApplication) => {
  const projectsRepo: Repository<Project> = app.get(
    getRepositoryToken(Project),
  );


  const jwtToken = await GivenUserIsLoggedIn(app);

  const organization = await OrganizationsTestUtils.createOrganization(
    app,
    jwtToken,
    E2E_CONFIG.organizations.valid.minimal(),
  );

  const regularProject = await ProjectsTestUtils.createProject(app, jwtToken, {
    ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
      countryCode: 'NAM',
      adminAreaLevel1Id: 'NAM.8_1',
      adminAreaLevel2Id: 'NAM.8.6_1',
    }),
    organizationId: organization.data.id,
  })

  const customPlanningAreaId = await request(app.getHttpServer())
    .post(`/api/v1/projects/planning-area/shapefile`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .attach(`file`, __dirname + `/test-planning-area.zip`)
    .then((response) => response.body.id)
    .catch((error) => {
      Logger.error(error);
      throw new Error(`[step] Could not upload planning area`);
    });

  const customPlanningAreaGridId = await request(app.getHttpServer())
  .post(`/api/v1/projects/planning-area/shapefile-grid`)
  .set('Authorization', `Bearer ${jwtToken}`)
  .attach(`file`, __dirname + `/test-grid-planning.zip`)
  .then((response) => response.body.id)
  .catch((error) => {
    Logger.error(error);
    throw new Error(`[step] Could not upload grid`);
  });

  const customProjectPlanningAreaGridId = await request(app.getHttpServer())
  .post(`/api/v1/projects/planning-area/shapefile-grid`)
  .set('Authorization', `Bearer ${jwtToken}`)
  .attach(`file`, __dirname + `/test-grid-planning.zip`)
  .then((response) => response.body.id)
  .catch((error) => {
    Logger.error(error);
    throw new Error(`[step] Could not upload grid`);
  });
  const customProjectId = await ProjectsTestUtils.createProject(app, jwtToken, {
    ...E2E_CONFIG.projects.valid.customArea({
      planningAreaId: customProjectPlanningAreaGridId,
      planningUnitGridShape: PlanningUnitGridShape.FromShapefile
    }),
    organizationId: organization.data.id,
   })
  .then((response) => response.data.id)
  .catch((error) => {
  Logger.error(error);
  throw new Error(`[step] Could not Create Custom area Project`);
});


  return {
    jwtToken,
    organizationId: organization.data.id,
    regularProjectId: regularProject.data.id,
    customPlanningAreaId,
    customPlanningAreaGridId,
    customProjectId,

    WhenRequestingTileForCustomArea: async (planningAreaId: string) =>
    request(app.getHttpServer())
        .get(
          `/api/v1/projects/planning-area/${planningAreaId}/preview/tiles/9/189/291.mvt`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .responseType('blob')
        .buffer()
        .then((response) => response.body)
        .catch((error) => {
          Logger.error(error);
          throw new Error(`[step] Could not Access tile preview grid tile`);
    }),
    WhenRequestingTileForCustomPlanningGrid: async (planningAreaId: string) =>
    request(app.getHttpServer())
        .get(
          `/api/v1/projects/planning-area/${planningAreaId}/grid/preview/tiles/9/189/291.mvt`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .responseType('blob')
        .buffer()
        .then((response) => response.body)
        .catch((error) => {
          Logger.error(error);
          throw new Error(`[step] Could not Access tile preview grid tile`);
    }),
      WhenRequestingTileForProjectPlanningArea: async (projectId: string) =>
      request(app.getHttpServer())
          .get(
            `/api/v1/projects/${projectId}/planning-area/tiles/9/189/291.mvt`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)
          .responseType('blob')
          .buffer()
        .then((response) => response.body)
        .catch((error) => {
        Logger.error(error);
        throw new Error(`[step] Could not access project planning area tiles`);
      }),
    WhenRequestingTileForProjectPlanningGrid: async (projectId: string) =>
      request(app.getHttpServer())
          .get(
            `/api/v1/projects/${projectId}/grid/tiles/9/189/291.mvt`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)
          .responseType('blob')
          .buffer()
          .then((response) => response.body)
          .catch((error) => {
          Logger.error(error);
          throw new Error(`[step] Could not access project grid tiles`);
        }),

    ThenItContainsPlaningAreaTile: async (
      mvt: Buffer
    ) => {
      const tile = decodeMvt(mvt)
      expect(tile.layers).toBeDefined();

    },
    ThenItContainsGridTile: async (
      mvt: Buffer
    ) => {
      const tile = decodeMvt(mvt)
      expect(tile.layers).toBeDefined();

    },
    cleanup: async () => {

      await projectsRepo.delete({
        organization: {
          id: organization.data.id,
        },
      });


      await OrganizationsTestUtils.deleteOrganization(
        app,
        jwtToken,
        organization.data.id,
      );
    },
  };
};
