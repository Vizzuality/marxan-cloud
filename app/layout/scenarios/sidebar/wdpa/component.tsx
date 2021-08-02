import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import { motion } from 'framer-motion';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import Pill from 'layout/pill';
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
  const { setTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: projectData } = useProject(pid);
  const { data: scenarioData } = useScenario(sid);
  const { data: wdpaData } = useWDPACategories(
    projectData?.adminAreaLevel2Id
    || projectData?.adminAreaLevel1Id
    || projectData?.countryId,
  );

  useEffect(() => {
    return () => {
      setStep(0);
    };
  }, [tab]);

  if (!scenarioData || tab !== 'protected-areas') return null;

  return (
    <motion.div
      key="protected-areas"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Pill selected>
        <header className="flex items-baseline mb-5 space-x-4">
          <h2 className="text-lg font-medium font-heading">Protected areas</h2>

          {(wdpaData && !!wdpaData.length) && (
            <Steps step={step + 1} length={2} />
          )}
        </header>

        {step === 0 && (
          <ScenariosSidebarWDPACategories
            readOnly={readOnly}
            onSuccess={() => setStep(1)}
            onDismiss={() => dispatch(setTab('features'))}
          />
        )}

        {step === 1 && (
          <ScenariosSidebarWDPAThreshold
            readOnly={readOnly}
            onSuccess={() => dispatch(setTab('features'))}
            onBack={() => { setStep(0); }}
          />
        )}
      </Pill>
    </motion.div>
  );
};

export default ScenariosSidebarWDPA;
