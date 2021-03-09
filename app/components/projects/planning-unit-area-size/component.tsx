import React, { useState } from 'react';

import Icon from 'components/icon';
import Input from 'components/forms/input';
import Label from 'components/forms/label';

import INFO_SVG from 'svgs/project/info.svg?sprite';

import { PlanningUnitAreaSizeProps } from './types';

export const PlanningUnitAreaSize: React.FC<PlanningUnitAreaSizeProps> = ({
  size,
  onChange,
}: PlanningUnitAreaSizeProps) => {
  const [selectedSize, setSelectedSize] = useState<number>(size);

  return (
    <div className="mt-6">
      <div className="flex items-center">
        <Label theme="dark" className="uppercase text-xxs">Planning unit area size</Label>
        <button
          className="w-5 h-5 ml-2"
          type="button"
          onClick={() => console.info('Planning Unit Area size info button click')}
        >
          <Icon icon={INFO_SVG} />
        </button>
      </div>
      <div className="flex items-baseline mt-4">
        <div className="w-12">
          <Input
            className="text-2xl"
            defaultValue={selectedSize}
            onChange={(event) => {
              const newSize = Number(event.target.value);
              setSelectedSize(newSize);
              if (onChange) {
                onChange(newSize);
              }
            }}
            mode="dashed"
          />
        </div>
        <span>KM2</span>
      </div>
    </div>
  );
};

export default PlanningUnitAreaSize;
