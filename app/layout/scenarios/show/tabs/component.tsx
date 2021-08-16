import React, { useCallback } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioSlice } from 'store/slices/scenarios/detail';

import { motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';

import Tabs from 'components/tabs';

import { TABS } from './constants';
import { ScenariosSidebarTabsProps } from './types';

export const ScenariosSidebarTabs: React.FC<ScenariosSidebarTabsProps> = () => {
  const { query } = useRouter();
  const { sid } = query;
  const {
    isFetched: scenarioFetched,
  } = useScenario(sid);

  const scenarioSlice = getScenarioSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);

  const dispatch = useDispatch();

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
            This tab represents the steps needed to set up a
            conservation plan using Marxan:
          </p>

          <ul className="pl-6 space-y-1 list-decimal">
            <li>
              Decide if you want to lock existing
              <b> Protected areas</b>
              , or other conservation areas,
              into your Marxan solution.
            </li>
            <li>
              Add the
              {' '}
              <b>Features</b>
              {' '}
              you want to consider in your
              Marxan analysis, and set targets for each one of them.
            </li>
            <li>
              Run a gap analysis, assign a cost surface,
              or adjust planning units inside of your
              {' '}
              <b> Analysis</b>
              .
            </li>
            <li>
              After running a Marxan analysis,
              you can come back to the
              {' '}
              <b> Solutions</b>
              tab any time to view the results
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
              items={TABS}
              selected={tab}
              onSelected={onSelectedTab}
            />
          )}

        </Pill>

      </motion.div>

    </HelpBeacon>
  );
};

export default ScenariosSidebarTabs;
