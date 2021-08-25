import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'layout/scenarios/edit/sidebar/types';
import ScenariosSidebarWDPACategories from 'layout/scenarios/edit/wdpa/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/edit/wdpa/threshold';

import Steps from 'components/steps';

export interface ScenariosSidebarEditWDPAProps {

}

export const ScenariosSidebarEditWDPA: React.FC<ScenariosSidebarEditWDPAProps> = () => {
  const [step, setStep] = useState(0);
  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: projectData } = useProject(pid);

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};

  const {
    subtab: metaSubtab,
  } = scenarioEditingMetadata || {};

  const { data: wdpaData } = useWDPACategories({
    adminAreaId: projectData?.adminAreaLevel2Id
                 || projectData?.adminAreaLevel1I
                 || projectData?.countryId,
    customAreaId: !projectData?.adminAreaLevel2Id
                  && !projectData?.adminAreaLevel1I
                  && !projectData?.countryId ? projectData?.planningAreaId : null,
  });

  useEffect(() => {
    setStep(metaSubtab === 'protected-areas-percentage' ? 1 : 0);
  }, [metaSubtab]);

  // EFFECTS
  useEffect(() => {
    return () => {
      if (tab !== 'protected-areas') {
        setStep(0);
      }
    };
  }, [tab]);

  if (!scenarioData || tab !== 'protected-areas') return null;

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

          <Pill selected>
            <header className="flex items-baseline space-x-4">

              <h2 className="text-lg font-medium font-heading">Protected areas</h2>

              {(wdpaData && !!wdpaData.length) && (
                <Steps step={step + 1} length={2} />
              )}
            </header>

            {step === 0 && (
              <ScenariosSidebarWDPACategories
                onSuccess={() => {
                  setStep(1);
                  dispatch(setSubTab(ScenarioSidebarSubTabs.PROTECTED_AREAS_PERCENTAGE));
                }}
                onDismiss={() => dispatch(setTab(ScenarioSidebarTabs.FEATURES))}
              />
            )}

            {step === 1 && (
              <ScenariosSidebarWDPAThreshold
                onSuccess={() => dispatch(setTab(ScenarioSidebarTabs.FEATURES))}
                onBack={() => {
                  setStep(0);
                  dispatch(setSubTab(ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW));
                }}
              />
            )}
          </Pill>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarEditWDPA;
