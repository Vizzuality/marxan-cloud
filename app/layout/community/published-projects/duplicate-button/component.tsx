import React, { useState } from 'react';

import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';

import CHECKED_SVG from 'svgs/ui/checked.svg?sprite';
import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DuplicateButtonProps {

}

export const DuplicateButton: React.FC<DuplicateButtonProps> = () => {
  const { addToast } = useToasts();
  const [isDuplicated, setIsDuplicated] = useState(false);

  const handleDuplicated = () => {
    setIsDuplicated(true);

    addToast('success-project-duplicated', (
      <>
        <h2 className="font-medium">Success!</h2>
        <p className="text-sm">Project duplicated</p>
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
      theme={isDuplicated ? 'white' : 'transparent-white'}
    >
      {isDuplicated ? 'Duplicated' : 'Duplicate'}
      <Icon
        className={isDuplicated ? 'w-3 h-3 ml-1 text-black group-hover:text-white' : 'w-3.5 h-3.5 ml-2 text-white group-hover:text-black'}
        icon={isDuplicated ? CHECKED_SVG : DOWNLOAD_SVG}
      />
    </Button>
  );
};

export default DuplicateButton;
