import React, { useState } from 'react';

import Pill from 'layout/pill';
import ScenariosSidebarWDPACategories from 'layout/scenarios/sidebar/wdpa/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/sidebar/wdpa/threshold';

import { useRouter } from 'next/router';
import { useScenario } from 'hooks/scenarios';
import Steps from 'components/steps';

export interface ScenariosSidebarWDPAProps {
}

export const ScenariosSidebarWDPA: React.FC<ScenariosSidebarWDPAProps> = () => {
  const [step, setStep] = useState(0);
  const { query } = useRouter();
  const { sid } = query;

  const { data } = useScenario(sid);

  if (!data) return null;

  return (
    <Pill selected>
      <header className="flex items-baseline gap-4 mb-5">
        <h2 className="text-lg font-medium font-heading">Protected areas</h2>
        <Steps step={step + 1} length={2} />
      </header>

      {step === 0 && (
        <ScenariosSidebarWDPACategories
          onSuccess={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <ScenariosSidebarWDPAThreshold
          onSuccess={() => console.info('change tab')}
          onBack={() => { setStep(0); }}
        />
      )}
    </Pill>
  );
};

export default ScenariosSidebarWDPA;
