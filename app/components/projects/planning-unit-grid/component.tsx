import React, { useState } from 'react';

import Icon from 'components/icon';
import Label from 'components/forms/label';

import { PlanningUnit } from 'types/project-model';
import INFO_SVG from 'svgs/project/info.svg?sprite';

import PlanningUnitButton from './planning-unit-button/component';
import { PlanningUnitGridProps } from './types';
import { PlanningUnitButtonSizeProps } from './planning-unit-button/types';

export const PlanningUnitGrid: React.FC<PlanningUnitGridProps> = ({
  unit,
  onChange,
}: PlanningUnitGridProps) => {
  const [unitSelected, setUnitSelected] = useState(unit);
  const handleClick = (value) => {
    setUnitSelected(value);
    if (onChange) {
      onChange(value);
    }
  };
  return (
    <div className="mt-6">
      <div className="flex items-center">
        <Label theme="dark" className="uppercase text-xxs">Planning unit grid</Label>
        <button
          className="w-5 h-5 ml-2"
          type="button"
          onClick={() => console.info('Planning Unit Grid info button click')}
        >
          <Icon icon={INFO_SVG} />
        </button>
      </div>
      <div className="flex mt-4">
        <PlanningUnitButton
          unit={PlanningUnit.SQUARE}
          selected={unitSelected === PlanningUnit.SQUARE}
          size={PlanningUnitButtonSizeProps.MEDIUM}
          onClick={handleClick}
        />
        <PlanningUnitButton
          unit={PlanningUnit.HEXAGON}
          selected={unitSelected === PlanningUnit.HEXAGON}
          size={PlanningUnitButtonSizeProps.MEDIUM}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default PlanningUnitGrid;
