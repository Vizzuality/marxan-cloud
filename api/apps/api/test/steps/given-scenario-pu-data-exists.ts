import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';

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
      protectedByDefault: true,
    }),
    repo.create({
      scenarioId,
      lockStatus: LockStatus.LockedOut,
      puGeometryId: v4(),
      planningUnitMarxanId: 2,
      protectedByDefault: true,
    }),
    repo.create({
      scenarioId,
      lockStatus: LockStatus.LockedIn,
      puGeometryId: v4(),
      planningUnitMarxanId: 3,
      protectedByDefault: true,
    }),
  ]);
  return {
    scenarioId,
    rows,
  };
};
