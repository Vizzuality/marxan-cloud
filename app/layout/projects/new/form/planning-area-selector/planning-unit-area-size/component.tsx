import React, { useState } from 'react';

import Input from 'components/forms/input';
import Label from 'components/forms/label';
import InfoButton from 'components/info-button';

import { PlanningUnitAreaSizeProps } from './types';

export const PlanningUnitAreaSize: React.FC<PlanningUnitAreaSizeProps> = ({
  size,
  onChange,
  ...rest
}: PlanningUnitAreaSizeProps) => {
  const [selectedSize, setSelectedSize] = useState<number>(size);

  return (
    <div className="mt-6">
      <div className="flex items-center">
        <Label theme="dark" className="mr-2 uppercase text-xxs">Planning unit area size</Label>
        <InfoButton>
          <span>Planning unit area size info button</span>
        </InfoButton>
      </div>
      <div className="flex items-baseline mt-4">
        <div className="w-20">
          <Input
            {...rest}
            className="text-2xl"
            defaultValue={selectedSize}
            type="number"
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
