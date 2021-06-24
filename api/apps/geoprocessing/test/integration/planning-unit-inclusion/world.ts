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

export const createWorld = async (app: INestApplication) => {
  const scenarioId = v4();
  const puGeometryRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    getRepositoryToken(ScenariosPlanningUnitGeoEntity),
  );

  const storedGeometries: string[] = [];
  const geoToBeExcluded: string[] = [];
  const geoToBeIncluded: string[] = [];
  const geoToBeUntouched: string[] = [];

  return {
    scenarioId,
    geoToBeExcluded: () => geoToBeExcluded.sort(sortUuid),
    geoToBeIncluded: () => geoToBeIncluded.sort(sortUuid),
    geoToBeUntouched: () => geoToBeUntouched.sort(sortUuid),
    GivenPlanningUnitsExist: async (
      planningUnits: AreaUnitSampleGeometry,
    ): Promise<void> => {
      const toInclude = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter((f) => f.properties.shouldBeIncluded),
      );
      const toExclude = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter((f) => f.properties.shouldBeExcluded),
      );
      const untouched = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) =>
            !f.properties.shouldBeExcluded && !f.properties.shouldBeIncluded,
        ),
      );

      storedGeometries.push(...toInclude, ...toExclude, ...untouched);
      geoToBeExcluded.push(...toExclude);
      geoToBeIncluded.push(...toInclude);
      geoToBeUntouched.push(...untouched);

      await scenarioPuDataRepo.save(
        storedGeometries.map((id, index) =>
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
    cleanup: async () => {
      await puGeometryRepo.delete({
        id: In(storedGeometries),
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
