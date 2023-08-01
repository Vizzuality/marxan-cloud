import { useRouter } from 'next/router';

import { useScenario } from 'hooks/scenarios';

import { Tab } from 'types/navigation';

import BLM_CALIBRATION_SVG from 'svgs/navigation/blm-calibration.svg?sprite';
import COST_SURFACE_SVG from 'svgs/navigation/cost-surface.svg?sprite';
import FEATURES_SVG from 'svgs/navigation/features.svg?sprite';
import OVERVIEW_SVG from 'svgs/navigation/overview.svg?sprite';
import PLANNING_UNITS_SVG from 'svgs/navigation/planning-units.svg?sprite';
import PROTECTED_AREA_SVG from 'svgs/navigation/protected-areas.svg?sprite';
import TARGET_SVG from 'svgs/navigation/target.svg?sprite';

import type { SubMenuItem } from './submenu';

const SCENARIO_ROUTE = '/projects/[pid]/scenarios/';

export const useInventoryItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, tab } = query as { pid: string; tab: Tab };
  const isProjectRoute = route.startsWith('/projects/[pid]');

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
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: Tab };
  const isScenarioRoute = route.startsWith(SCENARIO_ROUTE);

  return [
    {
      name: 'Protected areas',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=protected-areas-preview`,
      icon: PROTECTED_AREA_SVG,
      selected:
        isScenarioRoute &&
        (tab === 'protected-areas-preview' || tab === 'protected-areas-threshold'),
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
      icon: PLANNING_UNITS_SVG,
      selected: isScenarioRoute && tab === 'planning-unit-status',
    },
    {
      name: 'Features',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=features-add`,
      icon: FEATURES_SVG,
      selected: isScenarioRoute && (tab === 'features-add' || tab === 'features-target'),
    },
  ];
};

export const useSolutionItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: Tab };
  const isScenarioRoute = route.startsWith(SCENARIO_ROUTE);
  const scenarioQuery = useScenario(sid);

  return [
    {
      name: 'Overview',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=solutions-overview`,
      icon: OVERVIEW_SVG,
      selected: isScenarioRoute && tab === 'solutions-overview',
      disabled: scenarioQuery.data?.solutionsAreLocked,
    },
    {
      name: 'Target achievement',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=target-achievement`,
      icon: TARGET_SVG,
      selected: isScenarioRoute && tab === 'target-achievement',
      disabled: scenarioQuery.data?.solutionsAreLocked,
    },
  ];
};

export const useAdvancedSettingsItems = (): SubMenuItem[] => {
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: Tab };

  const isScenarioRoute = route.startsWith(SCENARIO_ROUTE);

  return [
    {
      name: 'Overview',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=overview`,
      icon: OVERVIEW_SVG,
      selected: isScenarioRoute && tab === 'overview',
    },
    {
      name: 'BLM calibration',
      route: `/projects/${pid}/scenarios/${sid}/edit?tab=blm-calibration`,
      icon: BLM_CALIBRATION_SVG,
      selected: isScenarioRoute && tab === 'blm-calibration',
    },
  ];
};
