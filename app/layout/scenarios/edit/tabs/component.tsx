import React, { useCallback, useMemo } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';
import { SCENARIO_EDITING_META_DATA_DEFAULT_VALUES } from 'utils/utils-scenarios';

import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import Recalculate from 'layout/scenarios/edit/tabs/recalculate';

import Tabs from 'components/tabs';
import { TabsProps } from 'components/tabs/component';

import { TABS } from './constants';
import { ScenariosSidebarTabsProps } from './types';

export const ScenariosSidebarTabs: React.FC<ScenariosSidebarTabsProps> = () => {
  const { query } = useRouter();
  const { sid } = query;
  const {
    data: scenarioData,
    isFetched: scenarioFetched,
  } = useScenario(sid);

  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};
  const {
    status: metaStatus,
  } = scenarioEditingMetadata || SCENARIO_EDITING_META_DATA_DEFAULT_VALUES;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const TABS_PARSED = useMemo<TabsProps['items']>(() => {
    if (!metaStatus) return [];

    return TABS.map((t) => {
      return {
        ...t,
        status: metaStatus[t.id] === 'empty' ? 'disabled' : 'active',
      };
    });
  }, [metaStatus]);

  const onSelectedTab = useCallback((t) => {
    const TAB = TABS.find((T) => T.id === t);
    dispatch(setTab(t));
    dispatch(setSubTab(TAB.subtab));
  }, [dispatch, setTab, setSubTab]);

  if (!sid) return null;

  return (
    <HelpBeacon
      id="scenarios-tabs"
      title="the marxan workflow"
      subtitle="Steps to follow for the analysis"
      content={(
        <div className="space-y-2">
          <p>
            This tab will show the steps needed to complete a
            conservation plan using Marxan. The logical workflow
            requires you to take some actions at each step
            as follows:
          </p>

          <ul className="pl-6 space-y-1 list-decimal">
            <li>
              First you will
              decide if you want to
              include existing conservation areas in
              <b> Protected areas</b>
              .
            </li>
            <li>
              Then you will
              add all the features you want to conserve
              and decide how much to conserve of each
              in
              {' '}
              <b> Features</b>
              .
            </li>
            <li>
              Next you will be able to see the current
              conservation state of your features, add a cost
              surface and decide
              if there are any other areas that
              you would like to exclude or
              include in
              {' '}
              <b> Analysis</b>
              .
            </li>
            <li>
              Finally, you will
              run Marxan and view the results in
              {' '}
              <b> Solutions</b>
              .
              You can then go back to the other tabs to make
              modifications and run Marxan again
            </li>
          </ul>

        </div>
      )}
    >

      <motion.div
        key="scenario-tabs"
        className="mt-2.5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >

        <Pill>

          {scenarioFetched && (
            <Tabs
              items={TABS_PARSED}
              selected={tab}
              onSelected={onSelectedTab}
            />
          )}

          <Recalculate
            visible={false}
            onRecalculate={() => { }}
          />

        </Pill>

      </motion.div>

    </HelpBeacon>
  );
};

export default ScenariosSidebarTabs;
