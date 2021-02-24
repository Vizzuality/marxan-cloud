import React, { useState } from 'react';

import CountryRegionSelector from 'components/countries/country-region-selector';
import PlanningUnitGrid from 'components/projects/planning-unit-grid';
import PlanningUnitAreaSize from 'components/projects/planning-unit-area-size';
import { PlanningUnit, PlanningUnitAreaSizeUnit, PlanningArea } from 'types/project-model';

import { PlanningAreaSelectorProps } from './types';

export const PlanningAreaSelector: React.FC<PlanningAreaSelectorProps> = ({
  area,
  onChange,
}: PlanningAreaSelectorProps) => {
  const [data, setData] = useState<PlanningArea>({
    size: { value: 10, unit: PlanningUnitAreaSizeUnit.KM2 },
    unit: PlanningUnit.HEXAGON,
    country: null,
    region: null,
  });
  const { size, unit } = data;

  console.info('area', area);

  return (
    <div>
      <CountryRegionSelector />
      <div className="flex">
        <PlanningUnitGrid
          unit={unit}
          onChange={(value) => {
            const newData = {
              ...data,
              unit: value,
            };
            setData(newData);
            if (onChange) {
              onChange(newData);
            }
          }}
        />
        <PlanningUnitAreaSize
          data={size}
          onChange={(value) => {
            const newData = {
              ...data,
              size: value,
            };
            setData(newData);
            if (onChange) {
              onChange(newData);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PlanningAreaSelector;
