import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { v4 } from 'uuid';

export const validDataWithGivenPuIds = (
  puids: string[],
  scenarioId = 'scenario-0000-fake-uuid',
): ScenariosPlanningUnitGeoEntity[] =>
  puids.map((id, index) => ({
    lockStatus: LockStatus.Unstated,
    planningUnitMarxanId: index++,
    protectedByDefault: false,
    scenarioId,
    puGeometryId: v4(),
    id: id,
  }));
