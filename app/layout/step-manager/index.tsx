import { useState } from 'react';

const StepManager = ({
  children,
}: {
  children: ({
    currentStep,
    onChangeStep,
  }: {
    currentStep: number;
    onChangeStep: (step: number) => void;
  }) => JSX.Element;
}): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(0);

  const onChangeStep = (step: typeof currentStep) => {
    setCurrentStep(step);
  };

  return children({ currentStep, onChangeStep });
};

export default StepManager;
