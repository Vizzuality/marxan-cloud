import React, { useCallback } from 'react';

import { motion } from 'framer-motion';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

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
  );
};

export default ScenariosSidebarTabs;
