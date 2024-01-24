import StepManager from 'layout/step-manager';

import WDPACategories from './categories';
import WDPAThreshold from './threshold';

export const GridSetupProtectedAreas = (): JSX.Element => {
  return (
    <StepManager>
      {({ currentStep, onChangeStep }) => (
        <>
          {currentStep === 0 && <WDPACategories onContinue={() => onChangeStep(1)} />}
          {currentStep === 1 && <WDPAThreshold onGoBack={() => onChangeStep(0)} />}
        </>
      )}
    </StepManager>
  );
};

export default GridSetupProtectedAreas;
