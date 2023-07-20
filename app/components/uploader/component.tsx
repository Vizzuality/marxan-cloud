import React from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

import { UploaderProps } from './types';

export const Uploader: React.FC<UploaderProps> = ({
  id,
  open,
  caption,
  children,
  disabled,
  theme = 'secondary',
  onOpen,
  onClose,
}: UploaderProps) => {
  return (
    <div className="mb-5 mt-3">
      <Button
        className="dropzone w-full cursor-pointer py-1 text-xs hover:bg-gray-500"
        theme={theme}
        size="base"
        disabled={disabled}
        onClick={onOpen}
      >
        {caption || 'Upload'}
        <Icon className="absolute right-6 h-4 w-4 text-white" icon={UPLOAD_SVG} />
      </Button>

      <Modal id={id} open={open} size="narrow" onDismiss={onClose}>
        {children}
      </Modal>
    </div>
  );
};

export default Uploader;
