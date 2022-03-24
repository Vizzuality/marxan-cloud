import { INestApplication } from '@nestjs/common';
import { EntityManager, In, Repository } from 'typeorm';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { Feature, MultiPolygon, Polygon } from 'geojson';

import {
  LockStatus,
  PlanningUnitGridShape,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import {
  AreaUnitSampleGeometry,
  AreaUnitSampleGeometryProps,
} from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/__mocks__/include-sample';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';

export type ForCase = 'singleFeature' | 'multipleFeatures';

const geomType = PlanningUnitGridShape.Square;

export const createWorld = async (app: INestApplication) => {
  const projectId = v4();
  const scenarioId = v4();
  const entityManager = app.get<EntityManager>(getEntityManagerToken());
  const projectsPuRepo: Repository<ProjectsPuEntity> = entityManager.getRepository(
    ProjectsPuEntity,
  );
  const puGeometryRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(ScenariosPlanningUnitGeoEntity),
  );

  const geometriesByCase: {
    [k in ForCase]: {
      storedGeometries: string[];
      planningUnitsToBeExcluded: string[];
      planningUnitsToBeIncluded: string[];
      planningUnitsToBeUntouched: string[];
    };
  } = {
    singleFeature: {
      storedGeometries: [],
      planningUnitsToBeExcluded: [],
      planningUnitsToBeIncluded: [],
      planningUnitsToBeUntouched: [],
    },
    multipleFeatures: {
      storedGeometries: [],
      planningUnitsToBeExcluded: [],
      planningUnitsToBeIncluded: [],
      planningUnitsToBeUntouched: [],
    },
  };

  return {
    scenarioId,
    planningUnitsToBeExcluded: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeExcluded.sort(sortUuid),
    planningUnitsToBeIncluded: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeIncluded.sort(sortUuid),
    planningUnitsToBeUntouched: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeUntouched.sort(sortUuid),
    GivenPlanningUnitsExist: async (
      forCase: ForCase,
      planningUnits: AreaUnitSampleGeometry,
    ): Promise<void> => {
      const geometriesToInclude = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) =>
            f.properties[forCase].shouldBeIncluded ||
            f.properties[forCase].protectedByDefault,
        ),
      );
      const geometriesToExclude = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) =>
            f.properties[forCase].shouldBeExcluded &&
            !f.properties[forCase].protectedByDefault,
        ),
      );
      const untouchedGeometries = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) =>
            !f.properties[forCase].shouldBeExcluded &&
            !f.properties[forCase].shouldBeIncluded &&
            !f.properties[forCase].protectedByDefault,
        ),
      );

      geometriesByCase[forCase].storedGeometries.push(
        ...geometriesToInclude,
        ...geometriesToExclude,
        ...untouchedGeometries,
      );

      const puToInclude = await projectsPuRepo.save(
        geometriesToInclude.map((geomId, index) => ({
          projectId,
          puid: index,
          geomId,
          geomType,
        })),
      );

      const puToExclude = await projectsPuRepo.save(
        geometriesToExclude.map((geomId, index) => ({
          projectId,
          puid: puToInclude.length + index,
          geomId,
          geomType,
        })),
      );

      const untouchedPu = await projectsPuRepo.save(
        untouchedGeometries.map((geomId, index) => ({
          projectId,
          puid: puToInclude.length + puToExclude.length + index,
          geomId,
          geomType,
        })),
      );

      const puToBeExcluded = (
        await scenarioPuDataRepo.save(
          puToExclude.map((projectPu) =>
            scenarioPuDataRepo.create({
              projectPuId: projectPu.id,
              scenarioId,
            }),
          ),
        )
      ).map((pu) => pu.id);

      const puToBeIncluded = (
        await scenarioPuDataRepo.save(
          puToInclude.map((projectPu) =>
            scenarioPuDataRepo.create({
              projectPuId: projectPu.id,
              scenarioId,
              protectedByDefault: true,
            }),
          ),
        )
      ).map((pu) => pu.id);

      const puToBeUnstated = (
        await scenarioPuDataRepo.save(
          untouchedPu.map((projectPu) =>
            scenarioPuDataRepo.create({
              projectPuId: projectPu.id,
              scenarioId,
            }),
          ),
        )
      ).map((pu) => pu.id);

      geometriesByCase[forCase].planningUnitsToBeExcluded.push(
        ...puToBeExcluded,
      );
      geometriesByCase[forCase].planningUnitsToBeIncluded.push(
        ...puToBeIncluded,
      );
      geometriesByCase[forCase].planningUnitsToBeUntouched.push(
        ...puToBeUnstated,
      );
    },
    GetLockedInPlanningUnits: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.LockedIn,
          },
        })
      )
        .map((entity) => entity.id)
        .sort(sortUuid),
    GetLockedOutPlanningUnits: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.LockedOut,
          },
        })
      )
        .map((entity) => entity.id)
        .sort(sortUuid),
    GetUnstatedPlanningUnits: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.Unstated,
          },
        })
      )
        .map((entity) => entity.id)
        .sort(sortUuid),
    cleanup: async (forCase: ForCase) => {
      await puGeometryRepo.delete({
        id: In(geometriesByCase[forCase].storedGeometries),
      });
    },
  };
};

const insertPuGeometryFromGeoJson = async (
  repo: Repository<PlanningUnitsGeom>,
  features: Feature<Polygon | MultiPolygon, AreaUnitSampleGeometryProps>[],
): Promise<string[]> => {
  const geometries = (
    await repo.insert(
      features.map((feature) => ({
        theGeom: () =>
          `st_multi(ST_GeomFromGeoJSON('${JSON.stringify(feature.geometry)}'))`,
        type: geomType,
      })),
    )
  ).identifiers;
  return geometries.map((geo) => geo.id);
};

const sortUuid = (a: string, b: string) => a.localeCompare(b);
