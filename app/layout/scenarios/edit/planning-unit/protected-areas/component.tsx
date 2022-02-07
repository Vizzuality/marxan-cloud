import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import ScenariosSidebarWDPACategories from 'layout/scenarios/edit/planning-unit/protected-areas/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/edit/planning-unit/protected-areas/threshold';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'layout/scenarios/edit/sidebar/types';

import Icon from 'components/icon';
// import Steps from 'components/steps';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosSidebarEditWDPAProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarEditWDPA: React.FC<ScenariosSidebarEditWDPAProps> = ({
  onChangeSection,
}: ScenariosSidebarEditWDPAProps) => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);
  // const { metadata } = scenarioData || {};
  // const { scenarioEditingMetadata } = metadata || {};

  // const {
  //   subtab: metaSubtab,
  // } = scenarioEditingMetadata || {};

  // useEffect(() => {
  //   setStep(metaSubtab === 'planning-unit-protected-areas' ? 1 : 0);
  // }, [metaSubtab]);

  // EFFECTS
  // useEffect(() => {
  //   return () => {
  //     if (tab !== 'planning-unit') {
  //       setStep(0);
  //     }
  //   };
  // }, [tab]);

  if (!scenarioData || tab !== 'planning-unit') return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <HelpBeacon
        id="scenarios-wdpa"
        title="Protected Areas"
        subtitle="Add protected areas to the conservation plan"
        content={(
          <div className="space-y-2">
            <p>
              Add here any existing protected areas you would
              like to include in the plan. They will be
              included as locked-in areas (meaning they will be
              included in all the solutions of this scenario).
            </p>
            <p>
              You can select current
              protected areas listed in World Database of
              Protected Areas (WCMC-UNEP)
              or upload your own protected area geometry.
            </p>
            <p>
              If you do
              not wish to include any protected areas, click on the
              <b> Skip to features</b>
              {' '}
              button below.
            </p>

          </div>
        )}
        modifiers={['flip']}
        tooltipPlacement="left"
      >

        <motion.div
          key="protected-areas"
          className="flex flex-col min-h-0 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="flex items-center pt-5 pb-1 space-x-3">
            <button
              aria-label="return"
              type="button"
              className="flex items-center w-full space-x-2 text-left focus:outline-none"
              onClick={() => {
                onChangeSection(null);
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
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarEditWDPA;
