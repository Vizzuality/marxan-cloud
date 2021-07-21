import { INestApplication } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { Feature, MultiPolygon, Polygon } from 'geojson';

import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import {
  AreaUnitSampleGeometry,
  AreaUnitSampleGeometryProps,
} from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/__mocks__/include-sample';
import {
  PlanningUnitsGeom,
  ShapeType,
} from '@marxan-jobs/planning-unit-geometry';

export type ForCase = 'singleFeature' | 'multipleFeatures';

export const createWorld = async (app: INestApplication) => {
  const scenarioId = v4();
  const puGeometryRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(ScenariosPlanningUnitGeoEntity),
  );

  const geometriesByCase: {
    [k in ForCase]: {
      storedGeometries: string[],
      geoToBeExcluded: string[],
      geoToBeIncluded: string[],
      geoToBeUntouched: string[],
    }
  } = {
    singleFeature: {
      storedGeometries: [],
      geoToBeExcluded: [],
      geoToBeIncluded: [],
      geoToBeUntouched: [],
    },
    multipleFeatures: {
      storedGeometries: [],
      geoToBeExcluded: [],
      geoToBeIncluded: [],
      geoToBeUntouched: [],
    },
  };

  return {
    scenarioId,
    geoToBeExcluded: (forCase: ForCase) =>
      geometriesByCase[forCase].geoToBeExcluded.sort(sortUuid),
    geoToBeIncluded: (forCase: ForCase) =>
      geometriesByCase[forCase].geoToBeIncluded.sort(sortUuid),
    geoToBeUntouched: (forCase: ForCase) =>
      geometriesByCase[forCase].geoToBeUntouched.sort(sortUuid),
    GivenPlanningUnitsExist: async (
      forCase: ForCase,
      planningUnits: AreaUnitSampleGeometry,
    ): Promise<void> => {
      const toInclude = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) => f.properties[forCase].shouldBeIncluded,
        ),
      );
      const toExclude = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) => f.properties[forCase].shouldBeExcluded,
        ),
      );
      const untouched = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) =>
            !f.properties[forCase].shouldBeExcluded &&
            !f.properties[forCase].shouldBeIncluded,
        ),
      );

      geometriesByCase[forCase].storedGeometries.push(...toInclude, ...toExclude, ...untouched);
      geometriesByCase[forCase].geoToBeExcluded.push(...toExclude);
      geometriesByCase[forCase].geoToBeIncluded.push(...toInclude);
      geometriesByCase[forCase].geoToBeUntouched.push(...untouched);

      await scenarioPuDataRepo.save(
        geometriesByCase[forCase].storedGeometries.map((id, index) =>
          scenarioPuDataRepo.create({
            puGeometryId: id,
            scenarioId,
            planningUnitMarxanId: index,
          }),
        ),
      );
    },
    GetLockedInGeometries: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.LockedIn,
          },
        })
      )
        .map((entity) => entity.puGeometryId)
        .sort(sortUuid),
    GetLockedOutGeometries: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.LockedOut,
          },
        })
      )
        .map((entity) => entity.puGeometryId)
        .sort(sortUuid),
    GetUnstatedGeometries: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.Unstated,
          },
        })
      )
        .map((entity) => entity.puGeometryId)
        .sort(sortUuid),
    cleanup: async (forCase: ForCase) => {
      await puGeometryRepo.delete({
        id: In(geometriesByCase[forCase].storedGeometries),
      });
      await scenarioPuDataRepo.delete({
        scenarioId,
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
        type: ShapeType.Square,
      })),
    )
  ).identifiers;
  return geometries.map((geo) => geo.id);
};

const sortUuid = (a: string, b: string) => a.localeCompare(b);
