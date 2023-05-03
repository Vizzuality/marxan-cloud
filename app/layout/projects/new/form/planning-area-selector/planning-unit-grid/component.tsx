import React, { useState } from 'react';

import Label from 'components/forms/label';
import InfoButton from 'components/info-button';
import { PlanningUnit } from 'types/project-model';

import PlanningUnitButton from './planning-unit-button/component';
import { PlanningUnitButtonSizeProps } from './planning-unit-button/types';
import { PlanningUnitGridProps } from './types';

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
    <div className="flex flex-col justify-between">
      <div className="flex items-center">
        <Label theme="dark" className="mr-2 text-xxs uppercase">
          Planning unit shape
        </Label>
        <InfoButton>
          <span>
            <h4 className="mb-2.5 font-heading text-lg">Planning unit shape</h4>
            <div className="space-y-2">
              <p>
                The planning units can have a regular shape (hexagons or squares) or an irregular
                shape (for example using management or ecological land units).
              </p>
            </div>
          </span>
        </InfoButton>
      </div>

      <div className="mt-3 flex">
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
