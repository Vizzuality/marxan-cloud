import React from 'react';

import { PlanningUnit } from 'types/project-model';

import PlanningUnitButton from './planning-unit-button/component';
import { PlanningUnitGridProps } from './types';

export const PlanningUnitGrid: React.FC<PlanningUnitGridProps> = ({
  unit,
}: PlanningUnitGridProps) => {
  return (
    <div className="flex">
      <PlanningUnitButton
        unit={PlanningUnit.SQUARE}
        selected={unit === PlanningUnit.SQUARE}
      />
      <PlanningUnitButton
        unit={PlanningUnit.HEXAGON}
        selected={unit === PlanningUnit.HEXAGON}
      />
    </div>
  );
};

export default PlanningUnitGrid;
