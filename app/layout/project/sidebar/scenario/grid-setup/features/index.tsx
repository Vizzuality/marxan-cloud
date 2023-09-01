import { useRouter } from 'next/router';

import { TABS } from 'layout/project/navigation/constants';
import StepManager from 'layout/step-manager';

import GridSetupFeaturesAdd from './add';
import GridSetupFeaturesTargets from './targets';

export const GridSetupFeatures = (): JSX.Element => {
  const { replace, query } = useRouter();
  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };

  return (
    <StepManager defaultStep={tab === TABS['scenario-features-targets-spf'] ? 1 : 0}>
      {({ currentStep, onChangeStep }) => (
        <>
          {currentStep === 0 && (
            <GridSetupFeaturesAdd
              onContinue={() => {
                onChangeStep(1);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                replace(
                  `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-features-targets-spf']}`,
                  null,
                  { shallow: true }
                );
              }}
            />
          )}
          {currentStep === 1 && (
            <GridSetupFeaturesTargets
              onGoBack={() => {
                onChangeStep(0);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                replace(
                  `/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-features']}`,
                  null,
                  { shallow: true }
                );
              }}
            />
          )}
        </>
      )}
    </StepManager>
  );
};

export default GridSetupFeatures;
