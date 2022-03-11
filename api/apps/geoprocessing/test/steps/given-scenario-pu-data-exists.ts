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

// TODO monorepo - copy of api-step
export const GivenScenarioPuDataExists = async (
  entityManager: EntityManager,
  projectId: string,
  scenarioId: string,
): Promise<ScenariosPlanningUnitGeoEntity[]> => {
  const [first, second, third] = await GivenProjectsPuExists(
    entityManager,
    projectId,
  );

  const rows = await entityManager.save(ScenariosPlanningUnitGeoEntity, [
    {
      scenarioId,
      lockStatus: LockStatus.Unstated,
      projectPuId: first.id,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedOut,
      projectPuId: second.id,
    },
    {
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      projectPuId: third.id,
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
