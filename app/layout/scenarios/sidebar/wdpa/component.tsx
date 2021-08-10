import React, { useState, useEffect, useCallback } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useProject } from 'hooks/projects';
import { useScenario, useSaveScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'layout/scenarios/sidebar/types';
import ScenariosSidebarWDPACategories from 'layout/scenarios/sidebar/wdpa/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/sidebar/wdpa/threshold';

import Steps from 'components/steps';

export interface ScenariosSidebarWDPAProps {
  readOnly?: boolean;
}

export const ScenariosSidebarWDPA: React.FC<ScenariosSidebarWDPAProps> = ({
  readOnly,
}: ScenariosSidebarWDPAProps) => {
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

  const { subtab: refSubtab } = scenarioEditingMetadata || {};

  const { data: wdpaData } = useWDPACategories(
    projectData?.adminAreaLevel2Id
    || projectData?.adminAreaLevel1Id
    || projectData?.countryId,
  );

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const saveScenarioPAStatusOnBack = useCallback(async () => {
    saveScenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: mergeScenarioStatusMetaData(scenarioEditingMetadata, 'protected-areas', 'protected-areas-preview'),
      },
    });
  }, [saveScenarioMutation, sid, scenarioEditingMetadata]);

  useEffect(() => {
    const reloadStep = refSubtab === 'protected-areas-preview' ? 0 : 1;
    setStep(reloadStep);
  }, [refSubtab]);

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
                readOnly={readOnly}
              />
            )}

            {step === 1 && (
              <ScenariosSidebarWDPAThreshold
                onSuccess={() => dispatch(setTab(ScenarioSidebarTabs.FEATURES))}
                onBack={() => {
                  setStep(0);
                  dispatch(setSubTab(ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW));
                  saveScenarioPAStatusOnBack();
                }}
                readOnly={readOnly}
              />
            )}
          </Pill>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarWDPA;
