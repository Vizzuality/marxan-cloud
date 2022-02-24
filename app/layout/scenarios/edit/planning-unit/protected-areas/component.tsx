import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';

import { useScenario } from 'hooks/scenarios';

import ScenariosSidebarWDPACategories from 'layout/scenarios/edit/planning-unit/protected-areas/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/edit/planning-unit/protected-areas/threshold';

import Icon from 'components/icon';
// import Steps from 'components/steps';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosSidebarEditWDPAProps {
}

export const ScenariosSidebarEditWDPA: React.FC<ScenariosSidebarEditWDPAProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  if (!scenarioData || tab !== ScenarioSidebarTabs.PLANNING_UNIT) return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <motion.div
        key="protected-areas"
        className="flex flex-col min-h-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="flex items-center pt-5 pb-1 space-x-3">
          <button
            aria-label="return"
            type="button"
            className="flex items-center w-full space-x-2 text-left focus:outline-none"
            onClick={() => {
              dispatch(setSubTab(null));
            }}
          >
            <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
            <h4 className="text-xs uppercase font-heading text-primary-500">Protected areas</h4>
          </button>
        </header>

        {(subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW) && (
          <ScenariosSidebarWDPACategories
            onSuccess={() => {
              dispatch(setSubTab(ScenarioSidebarSubTabs.PROTECTED_AREAS_THRESHOLD));
            }}
          />
        )}

        {(subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_THRESHOLD) && (
          <ScenariosSidebarWDPAThreshold
            onSuccess={() => {
              dispatch(setTab(ScenarioSidebarTabs.PLANNING_UNIT));
              dispatch(setSubTab(null));
            }}
            onBack={() => {
              dispatch(setSubTab(ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW));
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ScenariosSidebarEditWDPA;
