import React from 'react';

import { Button } from 'components/button/component';

import { ViewOnMapProps } from './types';

export const ViewOnMapCell: React.FC<ViewOnMapProps> = ({ row, onViewOnMap }: ViewOnMapProps) => {
  const { id, isSelected } = row;
  return (
    <Button
      theme="secondary-alt"
      size="s"
      className="flex justify-center w-full"
      onClick={() => {
        onViewOnMap(id);
      }}
    >
      {isSelected ? 'Selected' : 'Select solution'}
    </Button>
  );
};

export default ViewOnMapCell;
