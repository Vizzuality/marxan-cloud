import React, { useState } from 'react';

import Label from 'components/forms/label';
import InfoButton from 'components/info-button';
import { PlanningUnit } from 'types/api/project';

import PlanningUnitButton from './planning-unit-button';
import { PlanningUnitButtonProps } from './planning-unit-button/types';

export const PlanningUnitGrid = ({
  unit,
  onChange,
}: {
  unit: PlanningUnit;
  onChange?: (value: PlanningUnit) => void;
}) => {
  const [unitSelected, setUnitSelected] = useState(unit);
  const handleClick = (value: Parameters<PlanningUnitButtonProps['onClick']>[0]) => {
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
          unit="square"
          selected={unitSelected === 'square'}
          size="md"
          onClick={handleClick}
        />
        <PlanningUnitButton
          unit="hexagon"
          selected={unitSelected === 'hexagon'}
          size="md"
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default PlanningUnitGrid;
