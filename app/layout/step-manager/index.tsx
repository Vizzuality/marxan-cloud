import { useState } from 'react';

const StepManager = ({
  children,
  defaultStep = 0,
}: {
  children: ({
    currentStep,
    onChangeStep,
  }: {
    currentStep: number;
    onChangeStep: (step: number) => void;
  }) => JSX.Element;
  defaultStep?: number;
}): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(defaultStep);

  const onChangeStep = (step: typeof currentStep) => {
    setCurrentStep(step);
  };

  return children({ currentStep, onChangeStep });
};

export default StepManager;
