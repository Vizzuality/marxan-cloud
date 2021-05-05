import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ScenariosPlanningUnitGeoEntity } from '../../../src/modules/scenarios-planning-unit/entities/scenarios-planning-unit.geo.entity';
import { LockStatus } from '../../../src/modules/scenarios-planning-unit/lock-status.enum';

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
