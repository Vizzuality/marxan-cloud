import { JobStatus, Scenario, ScenarioType } from '../scenario.api.entity';
import { User } from '../../users/user.api.entity';
import { IUCNCategory } from '../../protected-areas/protected-area.geo.entity';

const scenarioBase = (): Scenario => ({
  createdAt: new Date('2021-05-10T10:25:11.959Z'),
  lastModifiedAt: new Date('2021-05-10T10:25:11.959Z'),
  createdBy: '00000000-0000-0000-0000-000000000000',
  createdByUser: {} as User,
  id: '00000000-0000-0000-0000-000000000000',
  name: `Scenario Name`,
  projectId: '00000000-0000-0000-0000-000000000000',
  status: JobStatus.done,
  type: ScenarioType.marxan,
  users: [],
  wdpaThreshold: undefined,
  wdpaIucnCategories: undefined,
  protectedAreaFilterByIds: undefined,
});

export const scenarioWithRequiredWatchedEmpty = (): Scenario => ({
  ...scenarioBase(),
  wdpaThreshold: undefined,
});

export const scenarioWithwdpaCategoriesWatchedPresent = (): Scenario => ({
  ...scenarioBase(),
  wdpaIucnCategories: [],
});

export const scenarioWithwdpaCategoriesAndCustomWdpaWatchedPresent = (): Scenario => ({
  ...scenarioBase(),
  wdpaIucnCategories: [IUCNCategory.III],
  protectedAreaFilterByIds: ['20000000-2000-2000-2000-200000000000'],
});

export const scenarioWithAllWatchedPresent = (): Scenario => ({
  ...scenarioBase(),
  wdpaIucnCategories: [],
  wdpaThreshold: 40,
});
