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
  onOpen,
  onClose,
}: UploaderProps) => {
  return (
    <div className="mt-3 mb-5">
      <Button
        className="w-full py-1 text-xs cursor-pointer dropzone hover:bg-gray-500"
        theme="secondary"
        size="base"
        disabled={disabled}
        onClick={onOpen}
      >
        {caption || 'Upload'}
        <Icon className="absolute w-4 h-4 text-white right-6" icon={UPLOAD_SVG} />
      </Button>

      <Modal
        id={id}
        open={open}
        size="narrow"
        onDismiss={onClose}
      >
        {children}
      </Modal>
    </div>
  );
};

export default Uploader;
