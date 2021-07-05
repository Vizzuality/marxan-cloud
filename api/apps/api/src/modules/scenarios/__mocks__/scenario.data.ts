import { JobStatus, Scenario, ScenarioType } from '../scenario.api.entity';
import { User } from '../../users/user.api.entity';

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
  ranAtLeastOnce: false,
});

export const scenarioWithRequiredWatchedEmpty = (): Scenario => ({
  ...scenarioBase(),
  wdpaThreshold: undefined,
});

export const scenarioWithAllWatchedPresent = (): Scenario => ({
  ...scenarioBase(),
  wdpaThreshold: 40,
});
