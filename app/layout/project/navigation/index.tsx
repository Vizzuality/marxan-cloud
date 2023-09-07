import { PropsWithChildren, useCallback, useEffect, useState, MouseEvent } from 'react';

import { useQueryClient } from 'react-query';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { TippyProps } from '@tippyjs/react/headless';

import { useRunScenario, useScenario, useScenarioStatus } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import Tooltip from 'components/tooltip';
import { useScenarioJobs } from 'layout/scenarios/edit/status/utils';
import { cn } from 'utils/cn';

import ADVANCED_SETTINGS_SVG from 'svgs/navigation/advanced-settings.svg?sprite';
import GRID_SETUP_SVG from 'svgs/navigation/grid-setup.svg?sprite';
import INVENTORY_SVG from 'svgs/navigation/inventory.svg?sprite';
import WHITE_LOGO_SVG from 'svgs/navigation/logo-white.svg';
import MENU_SVG from 'svgs/navigation/menu.svg?sprite';
import RUN_SCENARIO_SVG from 'svgs/navigation/run-scenario.svg?sprite';
import SCENARIO_LIST_SVG from 'svgs/navigation/scenario-list.svg?sprite';
import SOLUTIONS_SVG from 'svgs/navigation/solutions.svg?sprite';

import {
  MENU_COMMON_CLASSES,
  MENU_ITEM_COMMON_CLASSES,
  MENU_ITEM_ACTIVE_CLASSES,
  MENU_ITEM_BUTTON_COMMON_CLASSES,
  MENU_ITEM_BUTTON_DISABLED_CLASSES,
  ICON_COMMON_CLASSES,
  ICON_DISABLED_CLASSES,
  NAVIGATION_TREE,
} from './constants';
import {
  useInventoryItems,
  useGridSetupItems,
  useSolutionItems,
  useAdvancedSettingsItems,
} from './hooks';
import SubMenu from './submenu';
import type { NavigationTreeCategories } from './types';
import UserMenu from './user-menu';

export const MenuTooltip = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <div className="rounded-xl border border-gray-400 bg-gray-700 px-2 py-[0.5px] text-sm text-blue-300">
      {children}
    </div>
  );
};

export const TOOLTIP_OFFSET: TippyProps['offset'] = [0, 10];

export const Navigation = (): JSX.Element => {
  const queryClient = useQueryClient();
  const { query, route } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };

  const isProjectRoute = route === '/projects/[pid]';
  const isScenarioRoute = route.startsWith('/projects/[pid]/scenarios/');
  const { addToast } = useToasts();

  const [submenuState, setSubmenuState] = useState<{ [key in NavigationTreeCategories]: boolean }>({
    user: false,
    inventory: NAVIGATION_TREE.inventory.includes(tab),
    gridSetup: isScenarioRoute && NAVIGATION_TREE.gridSetup.includes(tab),
    solutions: isScenarioRoute && NAVIGATION_TREE.solutions.includes(tab),
    advancedSettings: isScenarioRoute && NAVIGATION_TREE.advancedSettings.includes(tab),
  });

  const inventoryItems = useInventoryItems();
  const gridSetupItems = useGridSetupItems();
  const solutionsItems = useSolutionItems();
  const advancedSettingsItems = useAdvancedSettingsItems();

  const { data: scenarioStatusData } = useScenarioStatus(pid, sid);
  const { jobs = [] } = scenarioStatusData || {};
  const JOBS = useScenarioJobs(jobs);

  const scenarioQuery = useScenario(sid);

  const scenarioIsRunning = JOBS.find((j) => j.kind === 'run')?.status === 'running';

  const runScenarioMutation = useRunScenario({});

  const toggleSubmenu = useCallback((submenuKey: NavigationTreeCategories) => {
    if (submenuKey === 'user') {
      return setSubmenuState((prevState) => ({
        ...prevState,
        [submenuKey]: !prevState[submenuKey],
      }));
    }

    return setSubmenuState((prevState) => {
      return Object.keys(prevState).reduce<typeof submenuState>(
        (acc, key) => ({
          ...acc,
          [key]: key === submenuKey,
        }),
        prevState
      );
    });
  }, []);

  const handleRunScenario = useCallback(() => {
    runScenarioMutation.mutate(
      { id: sid },
      {
        onSuccess: () => {
          addToast(
            'run-start',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Run started</p>
            </>,
            {
              level: 'success',
            }
          );
        },
        onError: () => {
          addToast(
            'error-run-start',
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">Scenario run failed</p>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [addToast, runScenarioMutation, sid]);

  const isSolutionsSectionEnabled = scenarioQuery.data?.ranAtLeastOnce ?? false;

  useEffect(() => {
    if (isProjectRoute && NAVIGATION_TREE.inventory.includes(tab)) toggleSubmenu('inventory');
    if (isScenarioRoute && NAVIGATION_TREE.gridSetup.includes(tab)) toggleSubmenu('gridSetup');
    if (isScenarioRoute && NAVIGATION_TREE.solutions.includes(tab)) toggleSubmenu('solutions');
    if (isScenarioRoute && NAVIGATION_TREE.advancedSettings.includes(tab))
      toggleSubmenu('advancedSettings');
  }, [tab, isProjectRoute, isScenarioRoute, toggleSubmenu]);

  const runJob = JOBS.find(({ kind }) => kind === 'run');

  useEffect(() => {
    const checkRunJob = async () => {
      if ((['done', 'failure'] as (typeof runJob)['status'][]).includes(runJob?.status)) {
        await queryClient.invalidateQueries(['scenario', sid]);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    checkRunJob();
  }, [runJob, queryClient, sid]);

  return (
    <nav className="z-20 flex h-screen max-w-[70px] flex-col items-center justify-between bg-gray-700 px-2 py-8">
      <div className="flex flex-col">
        <Link href="/">
          <Image alt="Marxan logo" width={55} height={7} src={WHITE_LOGO_SVG} />
        </Link>
        <div className="space-y-2 divide-y divide-gray-600">
          {/* // ? Common menu */}
          <div className="flex flex-col items-center">
            <ul className={MENU_COMMON_CLASSES}>
              <li
                className={cn({
                  [MENU_ITEM_COMMON_CLASSES]: true,
                  [MENU_ITEM_ACTIVE_CLASSES]: submenuState.user,
                })}
              >
                <Tooltip
                  placement="right"
                  offset={TOOLTIP_OFFSET}
                  content={<MenuTooltip>Menu</MenuTooltip>}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={MENU_ITEM_BUTTON_COMMON_CLASSES}
                        onClick={() => toggleSubmenu('user')}
                      >
                        <Icon className={ICON_COMMON_CLASSES} icon={MENU_SVG} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      sideOffset={20}
                      className="min-w-[410px] rounded-b-4xl rounded-tl-xl rounded-tr-4xl bg-white p-4"
                      collisionPadding={48}
                      onInteractOutside={() => toggleSubmenu('user')}
                    >
                      <UserMenu />
                    </PopoverContent>
                  </Popover>
                </Tooltip>
              </li>
            </ul>
          </div>
          {/* // ? Project menu */}
          {(isProjectRoute || isScenarioRoute) && (
            <ul className={MENU_COMMON_CLASSES}>
              <li
                className={cn({
                  [MENU_ITEM_COMMON_CLASSES]: true,
                  [MENU_ITEM_ACTIVE_CLASSES]: isProjectRoute && tab,
                })}
              >
                <Tooltip
                  placement="right"
                  offset={TOOLTIP_OFFSET}
                  content={<MenuTooltip>Inventory</MenuTooltip>}
                >
                  <button
                    type="button"
                    className={MENU_ITEM_BUTTON_COMMON_CLASSES}
                    onClick={() => toggleSubmenu('inventory')}
                  >
                    <Icon
                      className={cn({
                        [ICON_COMMON_CLASSES]: true,
                        'pointer-events-none': true,
                      })}
                      icon={INVENTORY_SVG}
                    />
                  </button>
                </Tooltip>
              </li>
              {submenuState.inventory && (
                <li>
                  <SubMenu items={inventoryItems} />
                </li>
              )}
              <li
                className={cn({
                  [MENU_ITEM_COMMON_CLASSES]: true,
                  [MENU_ITEM_ACTIVE_CLASSES]: isProjectRoute && !tab,
                })}
              >
                <Tooltip
                  placement="right"
                  offset={TOOLTIP_OFFSET}
                  content={<MenuTooltip>Scenarios</MenuTooltip>}
                >
                  <Link href={`/projects/${pid}`} className={MENU_ITEM_BUTTON_COMMON_CLASSES}>
                    <Icon className={ICON_COMMON_CLASSES} icon={SCENARIO_LIST_SVG} />
                  </Link>
                </Tooltip>
              </li>
            </ul>
          )}
          {/* // ? Scenario menu */}
          {isScenarioRoute && (
            <ul className={MENU_COMMON_CLASSES}>
              <li
                className={cn({
                  [MENU_ITEM_COMMON_CLASSES]: true,
                  [MENU_ITEM_ACTIVE_CLASSES]:
                    isScenarioRoute && NAVIGATION_TREE.gridSetup.includes(tab),
                })}
              >
                <Tooltip
                  placement="right"
                  offset={TOOLTIP_OFFSET}
                  content={<MenuTooltip>Grid setup</MenuTooltip>}
                >
                  <button
                    type="button"
                    className={MENU_ITEM_BUTTON_COMMON_CLASSES}
                    onClick={() => toggleSubmenu('gridSetup')}
                  >
                    <Icon className={ICON_COMMON_CLASSES} icon={GRID_SETUP_SVG} />
                  </button>
                </Tooltip>
              </li>
              {submenuState.gridSetup && (
                <li>
                  <SubMenu items={gridSetupItems} />
                </li>
              )}
              <li
                className={cn({
                  [MENU_ITEM_COMMON_CLASSES]: true,
                  [MENU_ITEM_ACTIVE_CLASSES]:
                    isScenarioRoute && NAVIGATION_TREE.advancedSettings.includes(tab),
                })}
              >
                <Tooltip
                  placement="right"
                  offset={TOOLTIP_OFFSET}
                  content={<MenuTooltip>Advanced settings</MenuTooltip>}
                >
                  <button
                    type="button"
                    className={MENU_ITEM_BUTTON_COMMON_CLASSES}
                    onClick={() => toggleSubmenu('advancedSettings')}
                  >
                    <Icon className={ICON_COMMON_CLASSES} icon={ADVANCED_SETTINGS_SVG} />
                  </button>
                </Tooltip>
              </li>
              {submenuState.advancedSettings && (
                <li>
                  <SubMenu items={advancedSettingsItems} />
                </li>
              )}
              <li
                className={cn({
                  [MENU_ITEM_COMMON_CLASSES]: true,
                  [MENU_ITEM_ACTIVE_CLASSES]:
                    isScenarioRoute &&
                    NAVIGATION_TREE.solutions.includes(tab) &&
                    isSolutionsSectionEnabled,
                })}
              >
                <Tooltip
                  placement="right"
                  offset={TOOLTIP_OFFSET}
                  content={<MenuTooltip>Solutions</MenuTooltip>}
                >
                  <button
                    type="button"
                    className={cn({
                      [MENU_ITEM_BUTTON_COMMON_CLASSES]: true,
                      [MENU_ITEM_BUTTON_DISABLED_CLASSES]: !isSolutionsSectionEnabled,
                    })}
                    onClick={(evt: MouseEvent<HTMLButtonElement>) => {
                      return !isSolutionsSectionEnabled
                        ? evt.preventDefault()
                        : toggleSubmenu('solutions');
                    }}
                  >
                    <Icon
                      className={cn({
                        [ICON_COMMON_CLASSES]: true,
                        [ICON_DISABLED_CLASSES]: !isSolutionsSectionEnabled,
                      })}
                      icon={SOLUTIONS_SVG}
                    />
                  </button>
                </Tooltip>
              </li>
              {submenuState.solutions && (
                <li>
                  <SubMenu items={solutionsItems} />
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      {sid && !scenarioIsRunning && (
        <div className="group flex flex-col-reverse items-center">
          <button
            type="button"
            className="peer relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tl from-[#01BDFE] to-[#843DC0] transition-colors after:absolute after:left-1/2 after:top-1/2 after:block after:h-[calc(100%-1px)] after:w-[calc(100%-1px)] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border after:border-transparent after:bg-gray-700 hover:after:bg-transparent"
            onClick={handleRunScenario}
          >
            <Icon className="z-10 h-6 w-6" icon={RUN_SCENARIO_SVG} />
          </button>
          <span className="mb-2 block text-center text-xs text-gray-400 transition-colors peer-hover:text-primary-200">
            Run scenario
          </span>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
