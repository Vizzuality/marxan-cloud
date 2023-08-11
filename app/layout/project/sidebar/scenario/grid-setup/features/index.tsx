import StepManager from 'layout/step-manager';

import GridSetupFeaturesAdd from './add';
import GridSetupFeaturesTargets from './targets';

export const GridSetupFeatures = (): JSX.Element => {
  return (
    <StepManager>
      {({ currentStep, onChangeStep }) => (
        <>
          {currentStep === 0 && <GridSetupFeaturesAdd onContinue={() => onChangeStep(1)} />}
          {currentStep === 1 && <GridSetupFeaturesTargets onGoBack={() => onChangeStep(0)} />}
        </>
      )}
    </StepManager>
  );
};

export default GridSetupFeatures;
