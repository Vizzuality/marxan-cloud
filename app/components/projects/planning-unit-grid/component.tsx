import Icon from 'components/icon';
import React, { useState } from 'react';

import { PlanningUnit } from 'types/project-model';
import INFO_SVG from 'svgs/project/info.svg?sprite';

import PlanningUnitButton from './planning-unit-button/component';
import { PlanningUnitGridProps } from './types';
import { ButtonSize } from './planning-unit-button/types';

export const PlanningUnitGrid: React.FC<PlanningUnitGridProps> = ({
  unit,
}: PlanningUnitGridProps) => {
  const [unitSelected, setUnitSelected] = useState(unit);
  return (
    <div className="mt-6">
      <div className="flex items-center">
        <h5 className="text-xs text-white uppercase">Planning unit grid</h5>
        <button
          className="w-4 h-4 ml-2"
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
          size={ButtonSize.MEDIUM}
          onClick={(value) => setUnitSelected(value)}
        />
        <PlanningUnitButton
          unit={PlanningUnit.HEXAGON}
          selected={unitSelected === PlanningUnit.HEXAGON}
          size={ButtonSize.MEDIUM}
          onClick={(value) => setUnitSelected(value)}
        />
        <PlanningUnitButton
          unit={PlanningUnit.UPLOAD}
          selected={unitSelected === PlanningUnit.UPLOAD}
          size={ButtonSize.MEDIUM}
          onClick={(value) => setUnitSelected(value)}
        />
      </div>
    </div>
  );
};

export default PlanningUnitGrid;
