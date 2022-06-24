import React, { useState } from 'react';

import CreateProject from './create-project-step';
import UploadFiles from './upload-files-step';

export interface LegacyUploadModalProps {
  onDismiss: () => void;
}

export const LegacyUploadModal: React.FC<LegacyUploadModalProps> = ({
  onDismiss,
}: LegacyUploadModalProps) => {
  const [step, setStep] = useState(1);

  return (
    <div className="mt-3 mb-5">
      {step === 1 && (
        <CreateProject
          onDismiss={onDismiss}
          setStep={setStep}
        />

      )}
      {step === 2 && (
        <UploadFiles
          onDismiss={() => {
            onDismiss();
            setStep(1);
          }}
          setStep={setStep}
        />

      )}
    </div>
  );
};

export default LegacyUploadModal;
