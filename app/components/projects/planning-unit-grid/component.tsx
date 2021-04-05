import React, { useState } from 'react';

import Label from 'components/forms/label';
import InfoButton from 'components/info-button';

import { PlanningUnit } from 'types/project-model';

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
        <Label theme="dark" className="mr-2 uppercase text-xxs">Planning unit grid</Label>
        <InfoButton>
          <span>Planning unit grid info button</span>
        </InfoButton>
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
