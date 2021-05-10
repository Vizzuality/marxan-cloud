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
});

export const scenarioWithAllWatchedEmpty = (): Scenario => ({
  ...scenarioBase(),
  wdpaThreshold: undefined,
  wdpaIucnCategories: undefined,
  protectedAreaFilterByIds: undefined,
});

export const scenarioWithAllWatchedPresent = (): Scenario => ({
  ...scenarioBase(),
  wdpaThreshold: 40,
  wdpaIucnCategories: [IUCNCategory.Ia, IUCNCategory.IV],
  protectedAreaFilterByIds: ['10000000-1000-1000-1000-100000000000'],
});
