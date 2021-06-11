import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import * as request from 'supertest';
import { In, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { Polygon } from 'geojson';
import { v4 } from 'uuid';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  PlanningUnitsGeom,
  ShapeType,
} from '@marxan-jobs/planning-unit-geometry';
import { GivenProjectExists } from '../steps/given-project';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';

export const createWorld = async () => {
  const app = await bootstrapApplication();
  const jwt = await GivenUserIsLoggedIn(app);
  const { cleanup: projectCleanup, projectId } = await GivenProjectExists(
    app,
    jwt,
  );
  const scenarioId = (
    await ScenariosTestUtils.createScenario(app, jwt, {
      name: `scenario-name`,
      type: ScenarioType.marxan,
      projectId,
    })
  ).data.id;
  const geometries: string[] = [];

  const puGeometryRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );
  const scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, jwt, scenarioId);
      await projectCleanup();
      await puGeometryRepo.delete({
        id: In(geometries),
      });
      await scenarioPuDataRepo.delete({
        scenarioId,
      });
      await app.close();
    },
    GivenScenarioWithPuAndLocks: async () => {
      const polygons: Polygon[] = [1, 2, 3, 4].map((i) => ({
        type: 'Polygon',
        coordinates: [
          [
            [0, i],
            [i, i],
            [i, 0],
            [0, 0],
            [0, i],
          ],
        ],
      }));
      const geoRows = (
        await puGeometryRepo.insert(
          polygons.map((poly) => ({
            theGeom: () =>
              `st_multi(ST_GeomFromGeoJSON('${JSON.stringify(poly)}'))`,
            type: ShapeType.Square,
          })),
        )
      ).identifiers;

      geometries.push(...geoRows.map((geo) => geo.id));
      await scenarioPuDataRepo.save(
        geometries.map((id, index) =>
          scenarioPuDataRepo.create({
            puGeometryId: id,
            scenarioId,
            planningUnitMarxanId: index,
          }),
        ),
      );
    },
    WhenGettingMarxanData: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/pu.dat`)
          .set('Authorization', `Bearer ${jwt}`)
      ).text,
  };
};
