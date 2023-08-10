import { useRouter } from 'next/router';

import BLM_CALIBRATION_SVG from 'svgs/navigation/blm-calibration.svg?sprite';
import COST_SURFACE_SVG from 'svgs/navigation/cost-surface.svg?sprite';
import FEATURES_SVG from 'svgs/navigation/features.svg?sprite';
import OVERVIEW_SVG from 'svgs/navigation/overview.svg?sprite';
import PLANNING_UNITS_SVG from 'svgs/navigation/planning-units.svg?sprite';
import PROTECTED_AREA_SVG from 'svgs/navigation/protected-areas.svg?sprite';
import TARGET_SVG from 'svgs/navigation/target.svg?sprite';

import { TABS } from './constants';
import type { SubMenuItem } from './submenu';

const SCENARIO_ROUTE = '/projects/[pid]/scenarios/';

export const useInventoryItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, tab } = query as { pid: string; tab: string };
  const isProjectRoute = route.startsWith('/projects/[pid]');

  return [
    {
      name: 'Protected areas',
      route: `/projects/${pid}?tab=${TABS['project-protected-areas']}`,
      icon: PROTECTED_AREA_SVG,
      selected: isProjectRoute && tab === TABS['project-protected-areas'],
    },
    {
      name: 'Cost surface',
      route: `/projects/${pid}?tab=${TABS['project-cost-surface']}`,
      icon: COST_SURFACE_SVG,
      selected: isProjectRoute && tab === TABS['project-cost-surface'],
    },

    {
      name: 'Features',
      route: `/projects/${pid}?tab=${TABS['project-features']}`,
      icon: FEATURES_SVG,
      selected: isProjectRoute && tab === TABS['project-features'],
    },
  ];
};

export const useGridSetupItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };
  const isScenarioRoute = route.startsWith(SCENARIO_ROUTE);

  return [
    {
      name: 'Protected Areas',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-protected-areas']}`,
      icon: PROTECTED_AREA_SVG,
      selected: isScenarioRoute && tab === TABS['scenario-protected-areas'],
    },
    {
      name: 'Cost Surface',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-cost-surface']}`,
      icon: COST_SURFACE_SVG,
      selected: isScenarioRoute && tab === TABS['scenario-cost-surface'],
    },
    {
      name: 'Planning Unit Status',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-planning-unit-status']}`,
      icon: PLANNING_UNITS_SVG,
      selected: isScenarioRoute && tab === TABS['scenario-planning-unit-status'],
    },
    {
      name: 'Features',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-features']}`,
      icon: FEATURES_SVG,
      selected: isScenarioRoute && TABS['scenario-features'] === tab,
    },
    {
      name: 'GAP Analysis',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-gap-analysis']}`,
      icon: FEATURES_SVG,
      selected: isScenarioRoute && TABS['scenario-gap-analysis'] === tab,
    },
  ];
};

export const useSolutionItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };
  const isScenarioRoute = route.startsWith(SCENARIO_ROUTE);

  return [
    {
      name: 'Overview',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-solutions']}`,
      icon: OVERVIEW_SVG,
      selected: isScenarioRoute && tab === TABS['scenario-solutions'],
    },
    {
      name: 'Target Achievement',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-target-achievement']}`,
      icon: TARGET_SVG,
      selected: isScenarioRoute && tab === TABS['scenario-target-achievement'],
    },
  ];
};

export const useAdvancedSettingsItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };
  const isScenarioRoute = route.startsWith(SCENARIO_ROUTE);

  return [
    {
      name: 'Overview',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-advanced-settings']}`,
      icon: OVERVIEW_SVG,
      selected: isScenarioRoute && tab === TABS['scenario-advanced-settings'],
    },
    {
      name: 'BLM Calibration',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-blm-calibration']}`,
      icon: BLM_CALIBRATION_SVG,
      selected: isScenarioRoute && tab === TABS['scenario-blm-calibration'],
    },
  ];
};
