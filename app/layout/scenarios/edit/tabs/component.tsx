import React, { useCallback, useMemo } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';

// import Recalculate from 'layout/scenarios/edit/tabs/recalculate';

import Tabs from 'components/tabs';
import { TabsProps } from 'components/tabs/component';
import HelpBeacon from 'layout/help/beacon';
import { SCENARIO_EDITING_META_DATA_DEFAULT_VALUES } from 'utils/utils-scenarios';

import { TABS, STATUS } from './constants';
import { ScenariosSidebarTabsProps } from './types';

export const ScenariosSidebarTabs: React.FC<ScenariosSidebarTabsProps> = () => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const { data: scenarioData, isFetched: scenarioFetched } = useScenario(sid);

  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};
  const { status: metaStatus } =
    scenarioEditingMetadata || SCENARIO_EDITING_META_DATA_DEFAULT_VALUES;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const TABS_PARSED = useMemo<TabsProps['items']>(() => {
    if (!metaStatus) return [];

    return TABS.map((t) => {
      return {
        ...t,
        status: STATUS[metaStatus[t.id]],
        warning: STATUS[metaStatus[t.id]] === 'outdated',
      };
    });
  }, [metaStatus]);

  const onSelectedTab = useCallback(
    (t) => {
      const TAB = TABS.find((T) => T.id === t);
      dispatch(setTab(t));
      dispatch(setSubTab(TAB.subtab));
    },
    [dispatch, setTab, setSubTab]
  );

  if (!sid) return null;

  return (
    <HelpBeacon
      id="scenarios-tabs"
      title="the marxan workflow"
      subtitle="Steps to follow for the analysis"
      content={
        <div className="space-y-2">
          <p>
            This tab will show the steps needed to complete a conservation plan using Marxan. The
            logical workflow requires you to take some actions at each step as follows:
          </p>

          <ul className="list-decimal space-y-1 pl-6">
            <li>
              The <b> Planning units</b> stage allows you to include conservation areas in your
              conservation plan, adjust or exlude other areas you don&apos;t want to consider, and
              include cost surfaces.
            </li>
            <li>
              Then you will add all the features you want to conserve and decide how much to
              conserve of each in <b> Features</b>.
            </li>
            <li>
              Next you will be able to review the current conservation coverage of your features in
              the network based on your actions in Step 1, and Calibrate your settings in{' '}
              <b> Parameters</b>.
            </li>
            <li>
              Finally, in the <b> Solutions</b> stage you will be able to run and view your results.
              You can make modifications to any of these stages as you go along.
            </li>
          </ul>
        </div>
      }
    >
      <motion.div
        key="scenario-tabs"
        className="mt-2.5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className={cx({
            'rounded-4xl bg-gray-700': true,
            'flex flex-grow flex-col': true,
          })}
        >
          <div
            className={cx({
              'flex flex-grow flex-col px-10': true,
            })}
          >
            <div className="flex flex-grow flex-col px-0.5 py-0.5">
              {scenarioFetched && (
                <Tabs items={TABS_PARSED} selected={tab} onSelected={onSelectedTab} />
              )}

              {/* <Recalculate
                visible={false}
                onRecalculate={() => { }}
              /> */}
            </div>
          </div>
        </div>
      </motion.div>
    </HelpBeacon>
  );
};

export default ScenariosSidebarTabs;
