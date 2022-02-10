import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';

import { useScenario } from 'hooks/scenarios';

import ScenariosSidebarSetupFeaturesAdd from 'layout/scenarios/edit/features/set-up/add';
import ScenariosSidebarSetupFeaturesTarget from 'layout/scenarios/edit/features/set-up/targets';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosSidebarSetUpProps {
}

export const ScenariosSidebarSetUp: React.FC<ScenariosSidebarSetUpProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  if (!scenarioData || tab !== ScenarioSidebarTabs.FEATURES) return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <motion.div
        key="set-up-features"
        className="flex flex-col min-h-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="flex items-center py-5 space-x-3">
          <button
            aria-label="return"
            type="button"
            className="flex items-center w-full space-x-2 text-left focus:outline-none"
            onClick={() => {
              dispatch(setSubTab(null));
            }}
          >
            <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
            <h4 className="text-xs uppercase font-heading text-primary-500">Set Up features</h4>
          </button>
        </header>

        {(subtab === ScenarioSidebarSubTabs.FEATURES_ADD) && (
          <ScenariosSidebarSetupFeaturesAdd />
        )}

        {(subtab === ScenarioSidebarSubTabs.FEATURES_TARGET) && (
          <ScenariosSidebarSetupFeaturesTarget
            onBack={() => {
              dispatch(setSubTab(ScenarioSidebarSubTabs.FEATURES_ADD));
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ScenariosSidebarSetUp;
