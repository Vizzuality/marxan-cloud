import React from 'react';

import Icon from 'components/icon';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

import { BestCellProps } from './types';

export const BestCell: React.FC<BestCellProps> = (isTheBest) => {
  return <>{isTheBest && <Icon className="h-3 w-3 text-gray-600" icon={STAR_SVG} />}</>;
};

export default BestCell;
