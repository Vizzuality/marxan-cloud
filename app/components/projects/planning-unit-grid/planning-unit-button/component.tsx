import React from 'react';

import { PlanningUnit } from 'types/project-model';
import Icon from 'components/icon';

import SQUARE_SVG from 'svgs/project/square.svg?sprite';
import SQUARE_SELECTED_SVG from 'svgs/project/square-selected.svg?sprite';
import HEXAGON_SVG from 'svgs/project/hexagon.svg?sprite';
import HEXAGON_SELECTED_SVG from 'svgs/project/hexagon-selected.svg?sprite';

import { PlanningUnitButtonProps } from './types';

export const PlanningUnitButton: React.FC<PlanningUnitButtonProps> = ({
  unit,
  selected,
}: PlanningUnitButtonProps) => (
  <div className="flex flex-col cursor-pointer">
    { unit === PlanningUnit.HEXAGON && (
      <>
        <Icon icon={selected ? HEXAGON_SELECTED_SVG : HEXAGON_SVG} />
        Hexagon
      </>
    )}
    { unit === PlanningUnit.SQUARE && (
      <>
        <Icon icon={selected ? SQUARE_SELECTED_SVG : SQUARE_SVG} />
        Square
      </>
    )}
  </div>
);

export default PlanningUnitButton;
