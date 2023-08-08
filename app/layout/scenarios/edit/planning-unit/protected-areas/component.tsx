import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';

import Icon from 'components/icon';
import ScenariosSidebarWDPACategories from 'layout/scenarios/edit/planning-unit/protected-areas/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/edit/planning-unit/protected-areas/threshold';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosSidebarEditWDPAProps {}

export const ScenariosSidebarEditWDPA: React.FC<ScenariosSidebarEditWDPAProps> = () => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  if (!scenarioData || tab !== ScenarioSidebarTabs.PLANNING_UNIT) return null;

  return (
    <div className="flex h-full w-full flex-grow flex-col overflow-hidden">
      <motion.div
        key="protected-areas"
        className="flex min-h-0 flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="flex items-center space-x-3 pb-1 pt-5">
          <button
            aria-label="return"
            type="button"
            className="flex items-center space-x-2 text-left focus:outline-none"
            onClick={() => {
              dispatch(setSubTab(null));
            }}
          >
            <Icon icon={ARROW_LEFT_SVG} className="h-3 w-3 rotate-180 transform text-primary-500" />
            <h4 className="font-heading text-xs uppercase text-primary-500">Protected areas</h4>
          </button>
        </header>

        {subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW && (
          <ScenariosSidebarWDPACategories />
        )}

        {subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_THRESHOLD && (
          <ScenariosSidebarWDPAThreshold />
        )}
      </motion.div>
    </div>
  );
};

export default ScenariosSidebarEditWDPA;
