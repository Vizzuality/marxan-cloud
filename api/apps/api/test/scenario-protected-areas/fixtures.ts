import * as request from 'supertest';
import { readFileSync } from 'fs';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommandBus, ICommand } from '@nestjs/cqrs';

import { ProtectedArea } from '@marxan/protected-areas';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { IUCNCategory } from '@marxan/iucn';
import { CalculatePlanningUnitsProtectionLevel } from '@marxan-api/modules/planning-units-protection-level';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';

import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { GivenUserExists } from '../steps/given-user-exists';
import { ProtectedAreaDto } from '@marxan-api/modules/scenarios/dto/protected-area.dto';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const commands: ICommand[] = [];

  const wdpa: Repository<ProtectedArea> = app.get(
    getRepositoryToken(ProtectedArea, DbConnections.geoprocessingDB),
  );
  const commandBus = app.get(CommandBus);
  // Namibia, Otjozondjupa
  const countryCode = `NAM`;
  const adminAreaLevel1Id = `NAM.4_1`;
  const customAreaName = `custom protected area`;

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const userWithNoRoleToken = await GivenUserIsLoggedIn(app, 'dd');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  let scenarioId: string;

  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

  const { projectId } = await GivenProjectExists(app, ownerToken, {
    name: `scenario-pa-${new Date().getTime()}`,
    countryId: countryCode,
    adminAreaLevel1Id,
  });

  commandBus.subscribe((command) => {
    commands.push(command);
  });

  return {
    GivenScenarioInsideNAM41WasCreated: async () => {
      const { id } = await GivenScenarioExists(app, projectId, ownerToken);
      scenarioId = id;
      return id;
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
    WhenGettingProtectedAreasAsOwner: async (scenarioId: string) =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .then((response) => response.body),
    WhenGettingProtectedAreasAsContributor: async (scenarioId: string) =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .then((response) => response.body),
    WhenGettingProtectedAreasAsViewer: async (scenarioId: string) =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .then((response) => response.body),
    WhenGettingProtectedAreasAsUserNotInScenario: async (scenarioId: string) =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${userWithNoRoleToken}`),
    ThenItContainsRelevantWdpa: async (response: unknown) => {
      expect(response).toEqual([
        {
          id: 'II',
          kind: 'global',
          name: 'II',
          selected: false,
        },
        {
          id: 'III',
          kind: 'global',
          name: 'III',
          selected: false,
        },
        {
          id: 'Not Applicable',
          kind: 'global',
          name: 'Not Applicable',
          selected: false,
        },
        {
          id: 'Not Reported',
          kind: 'global',
          name: 'Not Reported',
          selected: false,
        },
      ]);
    },
    GivenCustomProtectedAreaWasAddedToProject: async () => {
      const ids: { id: string }[] = await wdpa.query(
        `
          INSERT INTO "wdpa"("the_geom", "project_id", "full_name")
          SELECT ST_SetSRID(
                   ST_CollectionExtract(ST_Collect(
                                          ST_GeomFromGeoJSON(features ->> 'geometry')
                                          ), 3), 4326)::geometry,
                 $2,
                 $3
          FROM (
                 SELECT json_array_elements($1::json -> 'features') AS features
               ) AS f
          ON CONFLICT ON CONSTRAINT unique_custom_protected_area_geometries_per_project
          DO UPDATE
            SET full_name = EXCLUDED.full_name
          RETURNING "id";
        `,
        [
          readFileSync(__dirname + `/nam-protected-area.geojson`),
          projectId,
          customAreaName,
        ],
      );
      return ids[0].id;
    },
    ThenItContainsSelectedCustomArea: async (
      response: ProtectedAreaDto[],
      areaId: string,
    ) => {
      expect(response.find((e) => e.id === areaId)).toEqual({
        id: areaId,
        kind: `project`,
        name: customAreaName,
        selected: true,
      });
    },
    ThenItDoesNotContainsSelectedCustomArea: async (
      response: ProtectedAreaDto[],
      areaId: string,
    ) => {
      expect(response.find((e) => e.id === areaId)).toEqual({
        id: areaId,
        kind: `project`,
        name: customAreaName,
        selected: false,
      });
    },
    ThenItContainsNonSelectedCustomArea: async (
      response: ProtectedAreaDto[],
    ) => {
      expect(response.find((e) => e.kind === `project`)).toEqual({
        id: expect.any(String),
        kind: `project`,
        name: customAreaName,
        selected: false,
      });
    },
    GivenAreasWereSelectedAsOwner: async (
      scenarioId: string,
      category: IUCNCategory,
      customPaId: string,
    ) =>
      request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          areas: [
            {
              id: category,
              selected: true,
            },
            {
              id: customPaId,
              selected: true,
            },
          ],
          threshold: 50,
        })
        .then((response) => response.body),
    GivenAreasWereSelectedAsContributor: async (
      scenarioId: string,
      category: IUCNCategory,
      customPaId: string,
    ) =>
      request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .send({
          areas: [
            {
              id: category,
              selected: true,
            },
            {
              id: customPaId,
              selected: true,
            },
          ],
          threshold: 50,
        })
        .then((response) => response.body),
    GivenAreasWereSelectedAsViewer: async (
      scenarioId: string,
      category: IUCNCategory,
      customPaId: string,
    ) =>
      request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          areas: [
            {
              id: category,
              selected: true,
            },
            {
              id: customPaId,
              selected: true,
            },
          ],
          threshold: 50,
        }),
    ThenItContainsSelectedGlobalArea: async (
      response: ProtectedAreaDto[],
      category: IUCNCategory,
    ) => {
      expect(response.find((e) => e.id === category)).toEqual({
        id: category,
        kind: `global`,
        name: category,
        selected: true,
      });
    },
    ThenItDoesNotContainsSelectedGlobalArea: async (
      response: ProtectedAreaDto[],
      category: IUCNCategory,
    ) => {
      expect(response.find((e) => e.id === category)).toEqual({
        id: category,
        kind: `global`,
        name: category,
        selected: false,
      });
    },
    ThenCalculationsOfProtectionLevelWereTriggered: async (
      scenario: string,
    ) => {
      expect(
        (commands.find(
          (cmd) => cmd instanceof CalculatePlanningUnitsProtectionLevel,
        ) as CalculatePlanningUnitsProtectionLevel | undefined)?.scenarioId,
      ).toEqual(scenario);
    },
    ThenCalculationsOfProtectionLevelWereNotTriggered: async () => {
      expect(
        (commands.find(
          (cmd) => cmd instanceof CalculatePlanningUnitsProtectionLevel,
        ) as CalculatePlanningUnitsProtectionLevel | undefined)?.scenarioId,
      ).toEqual(undefined);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
  };
};
