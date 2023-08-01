import React from 'react';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import HEXAGON_SELECTED_SVG from 'svgs/project/hexagon-selected.svg?sprite';
import HEXAGON_SVG from 'svgs/project/hexagon.svg?sprite';
import SQUARE_SELECTED_SVG from 'svgs/project/square-selected.svg?sprite';
import SQUARE_SVG from 'svgs/project/square.svg?sprite';
// TEMPORARILY DISABLED until this is implemented
// import UPLOAD_SVG from 'svgs/project/upload.svg?sprite';
// import UPLOAD_SVG_SELECTED from 'svgs/project/upload-selected.svg?sprite';

import { PlanningUnitButtonProps } from './types';

export const PlanningUnitButton: React.FC<PlanningUnitButtonProps> = ({
  unit,
  selected,
  size,
  onClick,
}: PlanningUnitButtonProps) => {
  const getButtonClassName = () =>
    cn({
      'mb-2': true,
      'w-8 h-8': size === 'md',
      'w-16 h-16': size === 'lg',
      'w-4 h-4': size === 'sm',
    });
  return (
    <div
      className={cn({
        'mr-8 flex cursor-pointer flex-col text-xxs text-white': true,
        'opacity-50': !selected,
      })}
      role="button"
      tabIndex={0}
      onKeyPress={() => onClick && onClick(unit)}
      onClick={() => onClick && onClick(unit)}
    >
      {unit === 'hexagon' && (
        <>
          <Icon
            icon={selected ? HEXAGON_SELECTED_SVG : HEXAGON_SVG}
            className={getButtonClassName()}
          />
          Hexagon
        </>
      )}
      {unit === 'square' && (
        <>
          <Icon
            icon={selected ? SQUARE_SELECTED_SVG : SQUARE_SVG}
            className={getButtonClassName()}
          />
          Square
        </>
      )}
      {/* TEMPORARILY HIDDEN until this is implemented
       { unit === PlanningUnit.UPLOAD && (
        <>
          <Icon
            icon={selected ? UPLOAD_SVG_SELECTED : UPLOAD_SVG}
            className={getButtonClassName()}
          />
          Upload
        </>
      )} */}
    </div>
  );
};

export default PlanningUnitButton;
