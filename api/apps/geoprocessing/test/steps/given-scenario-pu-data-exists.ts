import {
  LockStatus,
  PlanningUnitGridShape,
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { DeepPartial, EntityManager } from 'typeorm';
import {
  GivenProjectsPu,
  GivenProjectsPuExists,
} from './given-projects-pu-exists';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';

export interface GivenScenarioPuDataExistsOpts {
  protectedByDefault: boolean;
}

const defaultGivenScenarioPuDataExistsOpts: GivenScenarioPuDataExistsOpts = {
  protectedByDefault: false,
};

export const GivenScenarioPuDataExists = async (
  entityManager: EntityManager,
  projectId: string,
  scenarioId: string,
  {
    protectedByDefault,
  }: GivenScenarioPuDataExistsOpts = defaultGivenScenarioPuDataExistsOpts,
): Promise<ScenariosPuPaDataGeo[]> => {
  const [first, second, third] = await GivenProjectsPuExists(
    entityManager,
    projectId,
  );

  /**
   * @todo Refactor taking into account the recent project/scenario/pu linkage
   * refactor.
   */
  const rows = await entityManager.save(ScenariosPuPaDataGeo, [
    {
      scenarioId,
      lockStatus: LockStatus.Available,
      projectPuId: first.id,
      projectPu: first,
      protectedByDefault,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedOut,
      projectPuId: second.id,
      projectPu: second,
      protectedByDefault,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      projectPuId: third.id,
      projectPu: third,
      protectedByDefault,
    },
  ]);
  return rows as ScenariosPuPaDataGeo[];
};

export const GivenScenarioPuDataWithStatusesSetByUserExists = async (
  entityManager: EntityManager,
  projectId: string,
  scenarioId: string,
  {
    protectedByDefault,
  }: GivenScenarioPuDataExistsOpts = defaultGivenScenarioPuDataExistsOpts,
): Promise<ScenariosPuPaDataGeo[]> => {
  const [first, second, third] = await GivenProjectsPuExists(
    entityManager,
    projectId,
  );

  const rows = await entityManager.save(ScenariosPuPaDataGeo, [
    {
      scenarioId,
      lockStatus: LockStatus.Available,
      projectPuId: first.id,
      projectPu: first,
      protectedByDefault,
      lockStatusSetByUser: false,
    },
    {
      scenarioId,
      lockStatus: LockStatus.Available,
      projectPuId: first.id,
      projectPu: first,
      protectedByDefault,
      lockStatusSetByUser: false,
    },
    {
      scenarioId,
      lockStatus: LockStatus.Available,
      projectPuId: first.id,
      projectPu: first,
      protectedByDefault,
      lockStatusSetByUser: true,
    },
    {
      scenarioId,
      lockStatus: LockStatus.Available,
      projectPuId: first.id,
      projectPu: first,
      protectedByDefault,
      lockStatusSetByUser: true,
    },
    {
      scenarioId,
      lockStatus: LockStatus.Available,
      projectPuId: first.id,
      projectPu: first,
      protectedByDefault,
      lockStatusSetByUser: true,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedOut,
      projectPuId: second.id,
      projectPu: second,
      protectedByDefault,
      lockStatusSetByUser: true,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedOut,
      projectPuId: second.id,
      projectPu: second,
      protectedByDefault,
      lockStatusSetByUser: false,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      projectPuId: third.id,
      projectPu: third,
      protectedByDefault,
      lockStatusSetByUser: true,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      projectPuId: third.id,
      projectPu: third,
      protectedByDefault,
      lockStatusSetByUser: false,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      projectPuId: third.id,
      projectPu: third,
      protectedByDefault,
      lockStatusSetByUser: false,
    },
  ]);
  return rows as ScenariosPuPaDataGeo[];
};

export const GivenScenarioAndProjectPuData = async (
  entityManager: EntityManager,
  projectId: string,
  scenarioId: string,
  count = 100,
  geomType: PlanningUnitGridShape = PlanningUnitGridShape.Square,
): Promise<{
  scenarioId: string;
  rows: ScenariosPlanningUnitGeoEntity[];
}> => {
  return entityManager.transaction(async (em) => {
    const projectPus = await GivenProjectsPu(em, projectId, count, geomType);
    return await GivenScenarioPuData(em, projectId, scenarioId, projectPus);
  });
};

export const GivenScenarioPuData = async (
  entityManager: EntityManager,
  projectId: string,
  scenarioId: string,
  projectPus: ProjectsPuEntity[],
): Promise<{
  scenarioId: string;
  rows: ScenariosPlanningUnitGeoEntity[];
}> => {
  const scenarioPuData: DeepPartial<ScenariosPuPaDataGeo>[] = projectPus.map(
    (projectPu) => ({
      scenarioId,
      lockStatus: LockStatus.Available,
      projectPuId: projectPu.id,
    }),
  );

  const rows = await entityManager.save(ScenariosPuPaDataGeo, scenarioPuData);
  return {
    scenarioId,
    rows: rows as ScenariosPlanningUnitGeoEntity[],
  };
};
