import { Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';

import { E2E_CONFIG } from '../e2e.config';
import { Project } from '@marxan-api/modules/projects/project.api.entity';


import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { decodeMvt } from '@marxan/utils/geo/decode-mvt';
import { PlanningAreaResponseDto } from '@marxan-api/modules/projects/dto/planning-area-response.dto';

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

  return {
    jwtToken,
    organizationId: organization.data.id,
    WhenCreatingCustomPlanningArea: async () => request(app.getHttpServer())
        .post(`/api/v1/projects/planning-area/shapefile`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach(`file`, __dirname + `/planning-area.zip`)
        .then((response) => response.body),
    WhenCreatingPlanningGridArea: async () => request(app.getHttpServer())
        .post(`/api/v1/projects/planning-area/shapefile-grid`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach(`file`, __dirname + `/planning-area-grid.zip`)
        .then((response) => response.body),
    WhenRequestingTileForCustomArea: async (planningAreaId: string) =>
    (
      await request(app.getHttpServer())
        .get(
          `/api/v1/project/planning-area/${planningAreaId}/preview/tiles/6/35/35.mvt`,
        )
        .responseType('blob')
        .buffer()
    ).body,
    WhenRequestingTileForCustomPlanningGrid: async (planningAreaId: string) =>
    (
      await request(app.getHttpServer())
        .get(
          `/api/v1/project/planning-area/${planningAreaId}/grid/preview/tiles/6/35/35.mvt`,
        )
        .responseType('blob')
        .buffer()
    ).body,
    WhenCreatingProjectWithAdminAreas: async () => request(app.getHttpServer())
          .post('/api/v1/projects')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            ...E2E_CONFIG.projects.valid.complete({
              countryCode: 'NAM',
              adminLevel1: 'NAM.8_1',
              adminLevel2: 'NAM.8.6_1',
            }),
            organizationId: organization.data.id,
          }).then((response) => response.body),
      WhenCreatingProjectWithCustomAreas: async (
        planningAreaId?: string,
        planningUnitGridShape?: PlanningUnitGridShape,
        planningUnitAreakm2?: number ) => request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.projects.valid.customArea({
            planningAreaId: planningAreaId,
            planningUnitGridShape: planningUnitGridShape,
            planningUnitAreakm2: planningUnitAreakm2,
          }),
          organizationId: organization.data.id,

        }).then((response) => response.body),
      WhenRequestingTileForProjectPlanningArea: async (projectId: string) =>
      (
        await request(app.getHttpServer())
          .get(
            `/api/v1/project/${projectId}/planning-area/tiles/6/35/35.mvt`,
          )
          .responseType('blob')
          .buffer()
      ).body,
    WhenRequestingTileForProjectPlanningGrid: async (projectId: string) =>
      (
        await request(app.getHttpServer())
          .get(
            `/api/v1/project/${projectId}/grid/tiles/6/35/35.mvt`,
          )
          .responseType('blob')
          .buffer()
      ).body,
    GivenPlanningAreaIsCreated: async (
        response: PlanningAreaResponseDto[]
      ) => response[0].id,

    ThenItContainsPlaningAreaTile: async (
      mvt: Buffer,
      customPlanningArea: { projectId: string },
    ) => {
      const tile = decodeMvt(mvt);
      const features = tile.layers['layer0']._features.map((_, index) =>
        tile.layers['layer0'].feature(index),
      );
      const customFeature = features.filter(
        (feature) => feature.properties.projectId === customPlanningArea.projectId,
      );

      expect(customFeature.length).toEqual(1);
      expect(features.length).toEqual(1);

    },
    ThenItContainsGridTile: async (
      mvt: Buffer,
      customPlanningArea: { projectId: string },
    ) => {
      const tile = decodeMvt(mvt);
      const features = tile.layers['layer0']._features.map((_, index) =>
        tile.layers['layer0'].feature(index),
      );
      const customFeature = features.filter(
        (feature) => feature.properties.projectId === customPlanningArea.projectId,
      );

      expect(customFeature.length).toEqual(1);
      expect(features.length).toEqual(20);

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
