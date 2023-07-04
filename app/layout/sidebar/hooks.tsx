import { useRouter } from 'next/router';

import COST_SURFACE_SVG from 'svgs/sidebar/cost-surface.svg?sprite';
import FEATURES_SVG from 'svgs/sidebar/features.svg?sprite';
import PLANNING_UNIT_STATUS_SVG from 'svgs/sidebar/planning-unit-status.svg?sprite';
import PROTECTED_AREA_SVG from 'svgs/sidebar/protected-area.svg?sprite';

import type { SubMenuItem } from './submenu';

const SCENARIO_ROUTE = '/projects/[pid]/scenarios/[sid]/edit';

export const useInventoryItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, tab } = query as { pid: string; tab: string };
  const isProjectRoute = route === '/projects/[pid]';

  return [
    {
      name: 'Protected areas',
      route: `/projects/${pid}?tab=protected-areas`,
      icon: PROTECTED_AREA_SVG,
      selected: isProjectRoute && tab === 'protected-areas',
    },
    {
      name: 'Cost surface',
      route: `/projects/${pid}?tab=cost-surface`,
      icon: COST_SURFACE_SVG,
      selected: isProjectRoute && tab === 'cost-surface',
    },

    {
      name: 'Features',
      route: `/projects/${pid}?tab=features`,
      icon: FEATURES_SVG,
      selected: isProjectRoute && tab === 'features',
    },
  ];
};

export const useGridSetupItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };
  const isScenarioRoute = route === SCENARIO_ROUTE;

  return [
    {
      name: 'Protected areas',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=protected-areas`,
      icon: PROTECTED_AREA_SVG,
      selected: isScenarioRoute && tab === 'protected-areas',
    },
    {
      name: 'Cost Surface',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=cost-surface`,
      icon: COST_SURFACE_SVG,
      selected: isScenarioRoute && tab === 'cost-surface',
    },
    {
      name: 'Planning unit status',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=planning-unit-status`,
      icon: PLANNING_UNIT_STATUS_SVG,
      selected: isScenarioRoute && tab === 'planning-unit-status',
    },
    {
      name: 'Features',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=features`,
      icon: PROTECTED_AREA_SVG,
      selected: isScenarioRoute && tab === 'features',
    },
  ];
};

export const useSolutionItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };
  const isScenarioRoute = route === SCENARIO_ROUTE;

  return [
    {
      name: 'Overview',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=solutions`,
      icon: PROTECTED_AREA_SVG,
      selected: isScenarioRoute && tab === 'solutions',
    },
    {
      name: 'Target achievement',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=target-achievement`,
      icon: PROTECTED_AREA_SVG,
      selected: isScenarioRoute && tab === 'target-achievement',
    },
  ];
};

export const useAdvancedSettingsItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };
  const isScenarioRoute = route === SCENARIO_ROUTE;

  return [
    {
      name: 'Overview',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=advanced-settings`,
      icon: PROTECTED_AREA_SVG,
      selected: isScenarioRoute && tab === 'advanced-settings',
    },
    {
      name: 'BLM calibration',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=blm-calibration`,
      icon: PROTECTED_AREA_SVG,
      selected: isScenarioRoute && tab === 'blm-calibration',
    },
  ];
};
