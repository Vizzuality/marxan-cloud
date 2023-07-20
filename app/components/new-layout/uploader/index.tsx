import React from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';

import UPLOADER_SVG from 'svgs/ui/uploader.svg?sprite';

import { UploaderProps } from './types';

const Uploader = ({ id, open, caption, children, disabled, onOpen, onClose }: UploaderProps) => {
  return (
    <div>
      <Button
        className="dropzone flex w-full cursor-pointer space-x-2 !px-5 py-1 text-sm hover:opacity-80"
        theme="primary"
        size="base"
        disabled={disabled}
        onClick={onOpen}
      >
        <span>{caption || 'Upload'}</span>
        <Icon className="h-6 w-6 text-black" icon={UPLOADER_SVG} />
      </Button>

      <Modal id={id} open={open} size="narrow" onDismiss={onClose}>
        {children}
      </Modal>
    </div>
  );
};

export default Uploader;
