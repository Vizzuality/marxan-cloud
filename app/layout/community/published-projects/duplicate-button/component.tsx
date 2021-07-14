import React from 'react';

import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DuplicateButtonProps {
  id: string;
  name: string;
}

export const DuplicateButton: React.FC<DuplicateButtonProps> = ({
  id,
  name,
}: DuplicateButtonProps) => {
  const { addToast } = useToasts();

  const handleDuplicated = () => {
    addToast(`success-project-duplicated-${id}`, (
      <>
        <h2 className="font-medium">Success!</h2>
        <p className="text-sm">
          Project
          {' '}
          {name}
          {' '}
          duplicated
        </p>
      </>
    ), {
      level: 'success',
    });
  };

  return (
    <Button
      className="px-6 group"
      onClick={handleDuplicated}
      size="s"
      theme="transparent-white"
    >
      Duplicate

      <Icon
        className="w-3.5 h-3.5 ml-2 text-white group-hover:text-black"
        icon={DOWNLOAD_SVG}
      />
    </Button>
  );
};

export default DuplicateButton;
