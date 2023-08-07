import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import ScenariosSidebarSetupFeaturesAdd from 'layout/scenarios/edit/features/set-up/add';
import ScenariosSidebarSetupFeaturesTarget from 'layout/scenarios/edit/features/set-up/targets';
import { ScenarioSidebarSubTabs } from 'utils/tabs';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export const ScenariosSidebarSetUp = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string; tab: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  return (
    <div className="flex h-full w-full flex-grow flex-col overflow-hidden">
      <motion.div
        key="set-up-features"
        className="flex min-h-0 flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="flex items-center space-x-3 py-5">
          <button
            aria-label="return"
            type="button"
            className="flex w-full items-center space-x-2 text-left focus:outline-none"
            onClick={() => {
              dispatch(setSubTab(null));
            }}
          >
            <Icon icon={ARROW_LEFT_SVG} className="h-3 w-3 rotate-180 transform text-primary-500" />
            <h4 className="font-heading text-xs uppercase text-primary-500">Set Up features</h4>
          </button>
        </header>

        {subtab === ScenarioSidebarSubTabs.FEATURES_ADD && <ScenariosSidebarSetupFeaturesAdd />}

        {subtab === ScenarioSidebarSubTabs.FEATURES_TARGET && (
          <ScenariosSidebarSetupFeaturesTarget />
        )}
      </motion.div>
    </div>
  );
};

export default ScenariosSidebarSetUp;
