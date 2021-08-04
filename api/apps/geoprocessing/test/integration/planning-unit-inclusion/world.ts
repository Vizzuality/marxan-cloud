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

      geometriesByCase[forCase].storedGeometries.push(
        ...toInclude,
        ...toExclude,
        ...untouched,
      );

      let index = 1;
      const puToBeExcluded = (
        await scenarioPuDataRepo.save(
          toExclude.map((id) =>
            scenarioPuDataRepo.create({
              puGeometryId: id,
              scenarioId,
              planningUnitMarxanId: index++,
            }),
          ),
        )
      ).map((pu) => pu.id);

      const puToBeIncluded = (
        await scenarioPuDataRepo.save(
          toInclude.map((id) =>
            scenarioPuDataRepo.create({
              puGeometryId: id,
              scenarioId,
              planningUnitMarxanId: index++,
            }),
          ),
        )
      ).map((pu) => pu.id);

      const puToBeUnstated = (
        await scenarioPuDataRepo.save(
          untouched.map((id) =>
            scenarioPuDataRepo.create({
              puGeometryId: id,
              scenarioId,
              planningUnitMarxanId: index++,
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
