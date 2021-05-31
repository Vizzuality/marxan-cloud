import { ScenariosPlanningUnitGeoEntity } from '../../../../scenarios-planning-unit/entities/scenarios-planning-unit.geo.entity';
import { LockStatus } from '../../../../scenarios-planning-unit/lock-status.enum';
import { v4 } from 'uuid';

export const validDataWithGivenPuIds = (
  puids: string[],
  scenarioId = 'scenario-0000-fake-uuid',
): ScenariosPlanningUnitGeoEntity[] =>
  puids.map((id, index) => ({
    lockStatus: LockStatus.Unstated,
    planningUnitMarxanId: index++,
    scenarioId,
    puGeometryId: id,
    id: v4(),
  }));
