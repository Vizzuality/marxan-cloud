import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { v4 } from 'uuid';

export const validDataWithGivenPuIds = (
  puids: string[],
  scenarioId = 'scenario-0000-fake-uuid',
): ScenariosPlanningUnitGeoEntity[] =>
  puids.map((id, _index) => ({
    lockStatus: LockStatus.Available,
    lockStatusSetByUser: false,
    protectedByDefault: false,
    scenarioId,
    projectPuId: v4(),
    id: id,
    featureList: [],
    setByUser: false,
  }));
