import React from 'react';

import PlanningUnitGrid from 'components/projects/planning-unit-grid';
import { PlanningUnit } from 'types/project-model';

import { PlanningAreaProps } from './types';

export const PlanningArea: React.FC<PlanningAreaProps> = ({
  area,
}: PlanningAreaProps) => {
  console.info('area', area);

  return (
    <div>
      <PlanningUnitGrid unit={PlanningUnit.HEXAGON} />
    </div>
  );
};

export default PlanningArea;
