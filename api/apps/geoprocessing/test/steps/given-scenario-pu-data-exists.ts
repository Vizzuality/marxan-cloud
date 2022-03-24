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
): Promise<ScenariosPlanningUnitGeoEntity[]> => {
  const [first, second, third] = await GivenProjectsPuExists(
    entityManager,
    projectId,
  );

  /**
   * @todo Refactor taking into account the recent project/scenario/pu linkage
   * refactor.
   */
  const rows = await entityManager.save(ScenariosPlanningUnitGeoEntity, [
    {
      scenarioId,
      lockStatus: LockStatus.Unstated,
      projectPuId: first.id,
      protectedByDefault,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedOut,
      projectPuId: second.id,
      protectedByDefault,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      projectPuId: third.id,
      protectedByDefault,
    },
  ]);
  return rows as ScenariosPlanningUnitGeoEntity[];
};

export const GivenScenarioPuData = async (
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

    const scenarioPuData: DeepPartial<ScenariosPuPaDataGeo>[] = projectPus.map(
      (projectPu) => ({
        scenarioId,
        lockStatus: LockStatus.Unstated,
        projectPuId: projectPu.id,
      }),
    );

    const rows = await em.save(ScenariosPuPaDataGeo, scenarioPuData);
    return {
      scenarioId,
      rows: rows as ScenariosPlanningUnitGeoEntity[],
    };
  });
};
