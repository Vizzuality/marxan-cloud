import React from 'react';

import Icon from 'components/icon';
import STAR_SVG from 'svgs/ui/star.svg?sprite';

import { BestCellProps } from './types';

export const BestCell: React.FC<BestCellProps> = (value) => {
  return (
    <>
      {value && <Icon className="w-3 h-3" icon={STAR_SVG} />}
    </>
  );
};

export default BestCell;
