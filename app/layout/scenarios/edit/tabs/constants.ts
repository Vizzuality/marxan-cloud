import { ScenarioSidebarTabs } from 'utils/tabs';

export const TABS = [
  {
    id: ScenarioSidebarTabs.PLANNING_UNIT,
    subtab: null,
    name: 'Planning unit',
  },
  {
    id: ScenarioSidebarTabs.FEATURES,
    subtab: null,
    name: 'Features',
  },
  {
    id: ScenarioSidebarTabs.PARAMETERS,
    subtab: null,
    name: 'Parameters',
  },
  {
    id: ScenarioSidebarTabs.SOLUTIONS,
    subtab: null,
    name: 'Solutions',
  },
];

export const STATUS = {
  empty: 'disabled',
  outdated: 'outdated',
  draft: 'active',
};
