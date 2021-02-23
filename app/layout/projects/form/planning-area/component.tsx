import React from 'react';

import CountryRegionSelector from 'components/countries/country-region-selector';
import PlanningUnitGrid from 'components/projects/planning-unit-grid';
import PlanningUnitAreaSize from 'components/projects/planning-unit-area-size';
import { PlanningUnit, PlanningUnitAreaSizeUnit } from 'types/project-model';

import { PlanningAreaProps } from './types';

export const PlanningArea: React.FC<PlanningAreaProps> = ({
  area,
}: PlanningAreaProps) => {
  console.info('area', area);

  return (
    <div>
      <CountryRegionSelector />
      <div className="flex">
        <PlanningUnitGrid unit={PlanningUnit.HEXAGON} />
        <PlanningUnitAreaSize
          size={10}
          unit={PlanningUnitAreaSizeUnit.KM2}
        />
      </div>
    </div>
  );
};

export default PlanningArea;
