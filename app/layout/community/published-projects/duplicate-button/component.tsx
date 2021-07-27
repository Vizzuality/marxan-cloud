import React from 'react';

import Button from 'components/button';
import Icon from 'components/icon';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DuplicateButtonProps {

}

export const DuplicateButton: React.FC<DuplicateButtonProps> = () => {
  return (
    <Button
      className="px-6 group"
      size="s"
      theme="transparent-white"
      type="submit"
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
