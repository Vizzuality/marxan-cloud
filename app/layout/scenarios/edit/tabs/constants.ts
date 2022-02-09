import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

export const TABS = [
  {
    id: ScenarioSidebarTabs.PLANNING_UNIT,
    subtab: null,
    name: 'Planning unit',
  },
  {
    id: ScenarioSidebarTabs.FEATURES,
    subtab: ScenarioSidebarSubTabs.FEATURES_ADD,
    name: 'Features',
  },
  {
    id: ScenarioSidebarTabs.PARAMETERS,
    subtab: ScenarioSidebarSubTabs.ANALYSIS_PREVIEW,
    name: 'Parameters',
  },
  {
    id: ScenarioSidebarTabs.SOLUTIONS,
    subtab: ScenarioSidebarSubTabs.SOLUTIONS_PREVIEW,
    name: 'Solutions',
  },
];

export const STATUS = {
  empty: 'disabled',
  outdated: 'outdated',
  draft: 'active',
};
