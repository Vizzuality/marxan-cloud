import * as request from 'supertest';
import { readFileSync } from 'fs';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ProtectedArea } from '@marxan/protected-areas';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { IUCNCategory } from '@marxan/iucn';

import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { CalculatePlanningUnitsProtectionLevel } from '@marxan-api/modules/planning-units-protection-level';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const cleanups: (() => Promise<void>)[] = [];
  const commands: ICommand[] = [];

  const wdpa: Repository<ProtectedArea> = app.get(
    getRepositoryToken(ProtectedArea, DbConnections.geoprocessingDB),
  );
  const commandBus = app.get(CommandBus);
  // Namibia, Otjozondjupa
  const countryCode = `NAM`;
  const adminAreaLevel1Id = `NAM.4_1`;
  const customAreaName = `custom protected area`;

  const token = await GivenUserIsLoggedIn(app);
  const { cleanup, projectId } = await GivenProjectExists(app, token, {
    name: `scenario-pa-${new Date().getTime()}`,
    countryCode,
    adminAreaLevel1Id,
  });

  commandBus.subscribe((command) => {
    commands.push(command);
  });

  cleanups.push(cleanup);
  cleanups.push(() =>
    wdpa
      .delete({
        projectId,
      })
      .then(() => void 0),
  );

  return {
    cleanup: async () => {
      await Promise.all(cleanups.map((clean) => clean()));
      await app.close();
    },
    GivenScenarioInsideNAM41WasCreated: async () => {
      const { id } = await GivenScenarioExists(app, projectId, token);
      return id;
    },
    WhenGettingProtectedAreas: async (scenarioId: string) =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${token}`)
        .then((response) => response.body),
    ThenInContainsRelevantWdpa: async (response: unknown) => {
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
          RETURNING id;
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
      response: any[],
      areaId: string,
    ) => {
      expect(response.find((e) => e.id === areaId)).toEqual({
        id: areaId,
        kind: `project`,
        name: customAreaName,
        selected: true,
      });
    },
    ThenItContainsNonSelectedCustomArea: async (response: any[]) => {
      expect(response.find((e) => e.kind === `project`)).toEqual({
        id: expect.any(String),
        kind: `project`,
        name: customAreaName,
        selected: false,
      });
    },
    GivenAreasWereSelected: async (
      scenarioId: string,
      category: IUCNCategory,
      customPaId: string,
    ) =>
      request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/protected-areas`)
        .set('Authorization', `Bearer ${token}`)
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
    ThenItContainsSelectedGlobalArea: async (
      response: any[],
      category: IUCNCategory,
    ) => {
      expect(response.find((e) => e.id === category)).toEqual({
        id: category,
        kind: `global`,
        name: category,
        selected: true,
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
  };
};
