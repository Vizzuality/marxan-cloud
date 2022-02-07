import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'layout/scenarios/edit/sidebar/types';

export const TABS = [
  {
    id: ScenarioSidebarTabs.PLANNING_UNIT,
    subtab: null,
    name: 'Planning unit',
  },
  {
    id: ScenarioSidebarTabs.FEATURES,
    subtab: ScenarioSidebarSubTabs.FEATURES_PREVIEW,
    name: 'Features',
  },
  {
    id: ScenarioSidebarTabs.ANALYSIS,
    subtab: ScenarioSidebarSubTabs.ANALYSIS_PREVIEW,
    name: 'Analysis',
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
