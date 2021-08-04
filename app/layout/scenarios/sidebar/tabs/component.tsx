import React, { useCallback } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';

import Tabs from 'components/tabs';

import { TABS } from './constants';
import { ScenariosSidebarTabsProps } from './types';

export const ScenariosSidebarTabs: React.FC<ScenariosSidebarTabsProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const onSelectedTab = useCallback((t) => {
    dispatch(setTab(t));
  }, [dispatch, setTab]);

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

          <ul className="list-decimal pl-6">
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

          <Tabs
            items={TABS}
            selected={tab}
            onSelected={onSelectedTab}
          />

        </Pill>

      </motion.div>
    </HelpBeacon>
  );
};

export default ScenariosSidebarTabs;
