import React, { useState } from 'react';

import CreateProject from './create-project';
import UploadFiles from './upload-files';

export interface LegacyUploadModalProps {
  onDismiss: (notCancel?: boolean) => void;
}

export const LegacyUploadModal: React.FC<LegacyUploadModalProps> = ({
  onDismiss,
}: LegacyUploadModalProps) => {
  const [step, setStep] = useState(1);

  return (
    <div className="mb-5 mt-3 overflow-y-auto overflow-x-hidden">
      {step === 1 && (
        <CreateProject
          onDismiss={(notCancel) => {
            onDismiss(notCancel);
          }}
          setStep={setStep}
        />
      )}
      {step === 2 && (
        <UploadFiles
          onDismiss={(notCancel) => {
            onDismiss(notCancel);
            setStep(1);
          }}
          setStep={setStep}
        />
      )}
    </div>
  );
};

export default LegacyUploadModal;
