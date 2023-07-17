import { INestApplication } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
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
  const dataSource = app.get<DataSource>(DataSource);
  const projectsPuRepo: Repository<ProjectsPuEntity> = await dataSource.getRepository(
    ProjectsPuEntity,
  );
  const puGeometryRepo: Repository<PlanningUnitsGeom> = await dataSource.getRepository(
    PlanningUnitsGeom,
  );
  const scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = await dataSource.getRepository(
    ScenariosPlanningUnitGeoEntity,
  );

  let geometriesByCase: {
    [k in ForCase]: {
      storedGeometries: string[];
      planningUnitsToBeExcluded: string[];
      planningUnitsToBeIncluded: string[];
      planningUnitsToBeMadeAvailable: string[];
      planningUnitsToBeUntouched: string[];
      planningUnitsToBeAvailableAfterExclusion: string[];
    };
  } = {
    singleFeature: {
      storedGeometries: [],
      planningUnitsToBeExcluded: [],
      planningUnitsToBeIncluded: [],
      planningUnitsToBeMadeAvailable: [],
      planningUnitsToBeUntouched: [],
      planningUnitsToBeAvailableAfterExclusion: [],
    },
    multipleFeatures: {
      storedGeometries: [],
      planningUnitsToBeExcluded: [],
      planningUnitsToBeIncluded: [],
      planningUnitsToBeMadeAvailable: [],
      planningUnitsToBeUntouched: [],
      planningUnitsToBeAvailableAfterExclusion: [],
    },
  };

  return {
    scenarioId,
    planningUnitsToBeExcluded: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeExcluded.sort(sortUuid),
    planningUnitsToBeIncluded: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeIncluded.sort(sortUuid),
    planningUnitsToBeMadeAvailable: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeMadeAvailable.sort(sortUuid),
    planningUnitsToBeUntouched: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeUntouched.sort(sortUuid),
    planningUnitsToBeMadeAvailableAfterExclusion: (forCase: ForCase) =>
      geometriesByCase[forCase].planningUnitsToBeAvailableAfterExclusion.sort(
        sortUuid,
      ),
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

      const geometriesToMakeAvailable = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) =>
            f.properties[forCase].shouldBeMadeAvailable &&
            !f.properties[forCase].protectedByDefault,
        ),
      );
      const untouchedGeometries = await insertPuGeometryFromGeoJson(
        puGeometryRepo,
        planningUnits.features.filter(
          (f) =>
            !f.properties[forCase].shouldBeExcluded &&
            !f.properties[forCase].shouldBeIncluded &&
            !f.properties[forCase].shouldBeMadeAvailable &&
            !f.properties[forCase].protectedByDefault,
        ),
      );

      geometriesByCase[forCase].storedGeometries.push(
        ...geometriesToInclude,
        ...geometriesToExclude,
        ...geometriesToMakeAvailable,
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

      const puToMakeAvailable = await projectsPuRepo.save(
        geometriesToMakeAvailable.map((geomId, index) => ({
          projectId,
          puid: puToInclude.length + puToExclude.length + index,
          geomId,
          geomType,
        })),
      );

      const untouchedPu = await projectsPuRepo.save(
        untouchedGeometries.map((geomId, index) => ({
          projectId,
          puid:
            puToInclude.length +
            puToExclude.length +
            puToMakeAvailable.length +
            index,
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

      const puToBeMadeAvailable = (
        await scenarioPuDataRepo.save(
          puToMakeAvailable.map((projectPu) =>
            scenarioPuDataRepo.create({
              projectPuId: projectPu.id,
              scenarioId,
            }),
          ),
        )
      ).map((pu) => pu.id);

      const puToBeUntouched = (
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
      geometriesByCase[forCase].planningUnitsToBeMadeAvailable.push(
        ...puToBeMadeAvailable,
      );
      geometriesByCase[forCase].planningUnitsToBeUntouched.push(
        ...puToBeUntouched,
      );
      geometriesByCase[forCase].planningUnitsToBeAvailableAfterExclusion.push(
        ...puToBeExcluded,
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
    GetPlanningUnitsLockedInByUser: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.LockedIn,
            setByUser: true,
          },
        })
      )
        .map((entity) => entity.id)
        .sort(sortUuid),
    GetPlanningUnitsLockedInByProtectedArea: async () =>
      (
        await scenarioPuDataRepo.find({
          where: {
            scenarioId,
            lockStatus: LockStatus.LockedIn,
            protectedByDefault: true,
            setByUser: false,
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
    GetAvailablePlanningUnits: async () =>
      /**
       * @debt: refactor this to use .find() with options
       * currently, possibly because of lockStatus property transform and typeorm breaking change,
       * not null condition is being passed to raw sql as '= null', instead of 'is null'
       */
      (
        await scenarioPuDataRepo
          .createQueryBuilder('scenarioPuData')
          .where('scenarioPuData.scenario_id = :scenarioId', { scenarioId })
          .andWhere('scenarioPuData.lockin_status IS NULL')
          .andWhere('scenarioPuData.lock_status_set_by_user = false')
          .getMany()
      )
        .map((entity) => entity.id)
        .sort(sortUuid),

    GetAvailablePlanningUnitsChangedByUser: async () =>
      (
        await scenarioPuDataRepo
          .createQueryBuilder('scenarioPuData')
          .where('scenarioPuData.scenario_id = :scenarioId', { scenarioId })
          .andWhere('scenarioPuData.lockin_status IS NULL')
          .andWhere('scenarioPuData.lock_status_set_by_user = true')
          .getMany()
      )
        .map((entity) => entity.id)
        .sort(sortUuid),

    GetAvailablePlanningUnitsNotSetByUser: async () =>
      (
        await scenarioPuDataRepo
          .createQueryBuilder('scenarioPuData')
          .where('scenarioPuData.scenario_id = :scenarioId', { scenarioId })
          .andWhere('scenarioPuData.lockin_status IS NULL')
          .andWhere('scenarioPuData.lock_status_set_by_user = false')
          .andWhere('scenarioPuData.protected_by_default = false')
          .getMany()
      )
        .map((entity) => entity.id)
        .sort(sortUuid),
    cleanup: async (forCase: ForCase) => {
      await puGeometryRepo.delete({
        id: In(geometriesByCase[forCase].storedGeometries),
      });

      geometriesByCase = {
        singleFeature: {
          storedGeometries: [],
          planningUnitsToBeExcluded: [],
          planningUnitsToBeIncluded: [],
          planningUnitsToBeMadeAvailable: [],
          planningUnitsToBeUntouched: [],
          planningUnitsToBeAvailableAfterExclusion: [],
        },
        multipleFeatures: {
          storedGeometries: [],
          planningUnitsToBeExcluded: [],
          planningUnitsToBeIncluded: [],
          planningUnitsToBeMadeAvailable: [],
          planningUnitsToBeUntouched: [],
          planningUnitsToBeAvailableAfterExclusion: [],
        },
      };
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
