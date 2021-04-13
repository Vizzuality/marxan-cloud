import React, { useCallback } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import Pill from 'layout/pill';
import Tabs from 'components/tabs';

const TABS = [
  {
    id: 'protected-areas',
    name: 'Protected areas',
  },
  {
    id: 'features',
    name: 'Features',
  },
  {
    id: 'analysis',
    name: 'Analysis',
  },
  {
    id: 'solutions',
    name: 'Solutions',
  },
];

export interface ScenariosSidebarTabsProps {
}

export const ScenariosSidebarTabs: React.FC<ScenariosSidebarTabsProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);
  const dispatch = useDispatch();

  const onSelectedTab = useCallback((t) => {
    dispatch(setTab(t));
  }, [dispatch, setTab]);

  if (!sid) return null;

  return (
    <div className="mt-2.5">
      <Pill>
        <Tabs
          items={TABS}
          selected={tab}
          onSelected={onSelectedTab}
        />
      </Pill>
    </div>
  );
};

export default ScenariosSidebarTabs;
