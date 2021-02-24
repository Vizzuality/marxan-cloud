import React, { useState } from 'react';

import Icon from 'components/icon';
import Input from 'components/forms/input';
import Select from 'components/dropdowns';

import INFO_SVG from 'svgs/project/info.svg?sprite';

import { PlanningUnitAreaSizeUnit } from 'types/project-model';

import { PlanningUnitAreaSizeProps } from './types';

export const PlanningUnitAreaSize: React.FC<PlanningUnitAreaSizeProps> = ({
  size,
  unit,
}: PlanningUnitAreaSizeProps) => {
  const [selectedSize, setSelectedSize] = useState(size);
  const [selectedUnit, setSelectedUnit] = useState(unit);

  return (
    <div className="mt-6">
      <div className="flex items-center">
        <h5 className="text-white uppercase text-xxs">Planning unit area size</h5>
        <button
          className="w-5 h-5 ml-2"
          type="button"
          onClick={() => console.info('Planning Unit Area size info button click')}
        >
          <Icon icon={INFO_SVG} />
        </button>
      </div>
      <div className="flex">
        <Input
          defaultValue={selectedSize}
          onChange={(event) => setSelectedSize(Number(event.target.value))}
          mode="dashed"
        />
        <Select
          theme="dark"
          size="base"
          status="none"
          mode="minimalistic"
          multiple={false}
          initialSelected={selectedUnit}
          options={Object.values(PlanningUnitAreaSizeUnit)
            .map((e) => ({ label: e, value: e }))}
          onChange={(value: string) => setSelectedUnit(PlanningUnitAreaSizeUnit[value])}
        />
      </div>
    </div>
  );
};

export default PlanningUnitAreaSize;
