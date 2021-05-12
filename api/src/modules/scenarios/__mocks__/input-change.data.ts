import { UpdateScenarioDTO } from '../dto/update.scenario.dto';
import { IUCNCategory } from '../../protected-areas/protected-area.geo.entity';

export const emptyWatchedChangeSet = (): UpdateScenarioDTO => ({
  customProtectedAreaIds: undefined,
  wdpaIucnCategories: undefined,
  wdpaThreshold: undefined,
});

export const fullWatchedChangeSet = (): UpdateScenarioDTO => ({
  customProtectedAreaIds: ['20000000-2000-2000-2000-200000000000'],
  wdpaIucnCategories: [IUCNCategory.III],
  wdpaThreshold: 30,
});

export const thresholdChangeSet = (): UpdateScenarioDTO => ({
  customProtectedAreaIds: undefined,
  wdpaIucnCategories: undefined,
  wdpaThreshold: 30,
});
