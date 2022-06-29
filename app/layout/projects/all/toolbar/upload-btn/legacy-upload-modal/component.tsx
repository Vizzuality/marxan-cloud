import React, { useState } from 'react';

import CreateProject from './create-project';
import UploadFiles from './upload-files';

export interface LegacyUploadModalProps {
  onDismiss: () => void;
}

export const LegacyUploadModal: React.FC<LegacyUploadModalProps> = ({
  onDismiss,
}: LegacyUploadModalProps) => {
  const [step, setStep] = useState(1);

  return (
    <div className="mt-3 mb-5 overflow-x-hidden overflow-y-auto">
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
