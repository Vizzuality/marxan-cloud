import { bootstrapApplication } from '../../utils/api-application';
import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import * as request from 'supertest';
import { EntityManager, In, Repository } from 'typeorm';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import {
  LockStatus,
  PlanningUnitGridShape,
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuCostDataGeo,
} from '@marxan/scenarios-planning-unit';
import { Polygon } from 'geojson';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { GivenProjectExists } from '../../steps/given-project';
import { ScenariosTestUtils } from '../../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { v4 } from 'uuid';
import { GivenUserExists } from '../../steps/given-user-exists';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const userNotInScenarioToken = await GivenUserIsLoggedIn(app, 'dd');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const { cleanup: projectCleanup, projectId } = await GivenProjectExists(
    app,
    ownerToken,
    {
      countryCode: 'BWA',
      adminAreaLevel1Id: 'BWA.12_1',
      adminAreaLevel2Id: 'BWA.12.1_1',
    },
  );
  let scenarioId: string;
  const geometries: string[] = [];
  const scenariosPuData: string[] = [];

  const entityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const projectsPuRepo: Repository<ProjectsPuEntity> = entityManager.getRepository(
    ProjectsPuEntity,
  );
  const puGeometryRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );
  const scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> =
    app.get(
      getRepositoryToken(
        ScenariosPlanningUnitGeoEntity,
        DbConnections.geoprocessingDB,
      ),
    );
  const scenarioPuDataCostRepo: Repository<ScenariosPuCostDataGeo> = app.get(
    getRepositoryToken(ScenariosPuCostDataGeo, DbConnections.geoprocessingDB),
  );

  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenarioId);
      await projectCleanup();
      await puGeometryRepo.delete({
        id: In(geometries),
      });
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
      const geomType = PlanningUnitGridShape.Square;
      const geoRows = (
        await puGeometryRepo.insert(
          polygons.map((poly) => ({
            theGeom: () =>
              `st_multi(ST_GeomFromGeoJSON('${JSON.stringify(poly)}'))`,
            type: geomType,
          })),
        )
      ).identifiers;
      geometries.push(...geoRows.map((geo) => geo.id));

      const projectPus = await projectsPuRepo.save(
        geometries.map((geomId, index) =>
          projectsPuRepo.create({
            geomId,
            geomType,
            projectId,
            puid: index,
          }),
        ),
      );

      const lockStatuses: Record<number, LockStatus | null> = {
        0: LockStatus.Unstated,
        1: LockStatus.LockedIn,
        2: LockStatus.LockedOut,
        3: null,
      };

      const scenarioPuData = await scenarioPuDataRepo.save(
        projectPus.map((pu, index) =>
          scenarioPuDataRepo.create({
            projectPuId: pu.id,
            scenarioId,
            lockStatus: lockStatuses[index] ?? null,
          }),
        ),
      );
      scenariosPuData.push(...scenarioPuData.map((spud) => spud.id));
      await scenarioPuDataCostRepo.save(
        scenarioPuData.map((spud, index) => ({
          cost: (index + 1) * 200,
          scenariosPuDataId: spud.id,
          scenariosPlanningUnit: spud,
          planningUnitId: v4(),
        })),
      );
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
    WhenGettingMarxanDataAsOwner: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/pu.dat`)
          .set('Authorization', `Bearer ${ownerToken}`)
      ).text,
    WhenGettingMarxanDataAsContributor: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/pu.dat`)
          .set('Authorization', `Bearer ${contributorToken}`)
      ).text,
    WhenGettingMarxanDataAsViewer: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/pu.dat`)
          .set('Authorization', `Bearer ${viewerToken}`)
      ).text,
    WhenGettingMarxanDataAsUserNotInScenario: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/pu.dat`)
        .set('Authorization', `Bearer ${userNotInScenarioToken}`),
    WhenGettingPuInclusionStateAsOwner: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenarioId}/planning-units`)
          .set('Authorization', `Bearer ${ownerToken}`)
      ).body,
    WhenGettingPuInclusionStateAsContributor: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenarioId}/planning-units`)
          .set('Authorization', `Bearer ${contributorToken}`)
      ).body,
    WhenGettingPuInclusionStateAsViewer: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenarioId}/planning-units`)
          .set('Authorization', `Bearer ${viewerToken}`)
      ).body,
    WhenGettingPuInclusionStateAsUserNotInScenario: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/planning-units`)
        .set('Authorization', `Bearer ${userNotInScenarioToken}`),
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
  };
};
