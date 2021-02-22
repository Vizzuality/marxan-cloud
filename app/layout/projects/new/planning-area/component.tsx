import React from 'react';

import { PlanningAreaProps } from './types';

export const PlanningArea: React.FC<PlanningAreaProps> = ({
  area,
}: PlanningAreaProps) => {
  console.info('area', area);

  return (
    <div>
      Hey!
    </div>
  );
};

export default PlanningArea;
