import React, { PropsWithChildren } from 'react';

import { HiOutlineArrowUpOnSquareStack } from 'react-icons/hi2';

import Button from 'components/button';
import Modal from 'components/modal';

export interface UploaderProps {
  id?: string;
  open?: boolean;
  caption?: string;
  disabled?: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const Uploader = ({
  id,
  open,
  caption,
  children,
  disabled,
  onOpen,
  onClose,
}: PropsWithChildren<UploaderProps>): JSX.Element => {
  return (
    <div className="mb-5 mt-3">
      <Button
        className="dropzone w-full cursor-pointer py-1 hover:bg-gray-500"
        theme="secondary"
        size="base"
        disabled={disabled}
        onClick={onOpen}
      >
        {caption || 'Upload'}
        <HiOutlineArrowUpOnSquareStack className="absolute right-6 h-5 w-5 text-white" />
      </Button>

      <Modal id={id} open={open} size="narrow" onDismiss={onClose}>
        {children}
      </Modal>
    </div>
  );
};

export default Uploader;
