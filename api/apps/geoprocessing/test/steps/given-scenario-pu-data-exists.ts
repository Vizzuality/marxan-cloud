import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';

// TODO monorepo - copy of api-step
export const GivenScenarioPuDataExists = async (
  repo: Repository<ScenariosPlanningUnitGeoEntity>,
  scenarioId = v4(),
): Promise<{
  scenarioId: string;
  rows: ScenariosPlanningUnitGeoEntity[];
}> => {
  const rows = await repo.save([
    repo.create({
      scenarioId,
      lockStatus: LockStatus.Unstated,
      puGeometryId: v4(),
      planningUnitMarxanId: 1,
    }),
    repo.create({
      scenarioId,
      lockStatus: LockStatus.LockedOut,
      puGeometryId: v4(),
      planningUnitMarxanId: 2,
    }),
    repo.create({
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      puGeometryId: v4(),
      planningUnitMarxanId: 3,
    }),
  ]);
  return {
    scenarioId,
    rows,
  };
};

export const GivenScenarioPuData = async (
  repo: Repository<ScenariosPlanningUnitGeoEntity>,
  scenarioId = v4(),
  count = 100,
): Promise<{
  scenarioId: string;
  rows: ScenariosPlanningUnitGeoEntity[];
}> => {
  const rows = await repo.save(
    [...Array(count).keys()].map((index) => ({
      scenarioId,
      lockStatus: LockStatus.Unstated,
      puGeometryId: v4(),
      planningUnitMarxanId: index + 1,
    })),
  );
  return {
    scenarioId,
    rows,
  };
};
