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

import { ProtectedAreaService } from '@marxan-api/modules/scenarios/protected-area';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const cleanups: (() => Promise<void>)[] = [];

  const wdpa: Repository<ProtectedArea> = app.get(
    getRepositoryToken(ProtectedArea, DbConnections.geoprocessingDB),
  );
  const scenarios: Repository<Scenario> = app.get(getRepositoryToken(Scenario));

  const protectedAreasService = app.get(ProtectedAreaService);
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

  cleanups.push(cleanup);

  return {
    cleanup: async () => {
      await Promise.all(cleanups.map((clean) => clean()));
      await app.close();
    },
    GivenScenarioInsideBRA21WasCreated: async () => {
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
    GivenCustomProtectedAreaWasAdded: async (
      scenarioIdWithAddedArea: string,
    ) => {
      await wdpa.query(
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
        `,
        [
          readFileSync(__dirname + `/nam-protected-area.geojson`),
          projectId,
          customAreaName,
        ],
      );
      // TODO emit ProtectedAreaCreatedEvent once it has its handler
      // to make sure to act as the job was finished
    },
    ThenItContainsSelectedCustomArea: async (response: any[]) => {
      expect(response.find((e) => e.kind === `project`)).toEqual({
        id: expect.any(String),
        kind: `project`,
        name: customAreaName,
        selected: false, // TODO true once implemented
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
    GivenWdpaCategoryWasSelected: async (
      scenarioIdWithAddedArea: string,
      category: IUCNCategory,
    ) => {
      // replace with common action/rest once it is implemented
      const globalAreas = await protectedAreasService.getGlobalProtectedAreas({
        countryId: countryCode,
        adminAreaLevel1: adminAreaLevel1Id,
      });
      const areasInCategory = globalAreas.areas[category];
      await scenarios.update(
        {
          id: scenarioIdWithAddedArea,
        },
        {
          protectedAreaFilterByIds: [areasInCategory[0]],
        },
      );
    },
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
  };
};
