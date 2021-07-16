import React, { useEffect } from 'react';

import { useSelector } from 'react-redux';

import Input from 'components/forms/input';
import Label from 'components/forms/label';
import InfoButton from 'components/info-button';

import { PlanningUnitAreaSizeProps } from './types';

export const PlanningUnitAreaSize: React.FC<PlanningUnitAreaSizeProps> = ({
  input,
}: PlanningUnitAreaSizeProps) => {
  const {
    minPuAreaSize,
    maxPuAreaSize,
  } = useSelector((state) => state['/projects/new']);

  useEffect(() => {
    if (minPuAreaSize) {
      const newSize = +parseInt(minPuAreaSize, 10);

      requestAnimationFrame(() => {
        input.onChange(newSize);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPuAreaSize]);

  return (
    <div className="mt-6">
      <div className="flex items-center">
        <Label theme="dark" className="mr-2 uppercase text-xxs">Planning unit area size</Label>
        <InfoButton>
          <span>Planning unit area size info button</span>
        </InfoButton>
      </div>
      <div className="flex items-baseline mt-4">
        <div className="w-full">
          <Input
            {...input}
            mode="dashed"
            className="text-2xl"
            type="number"
            min={+parseInt(minPuAreaSize, 10)}
            max={+parseInt(maxPuAreaSize, 10)}
            onChange={(event) => {
              const newSize = Number(event.target.value);

              input.onChange(newSize);
            }}
          />
        </div>
        <span>KM2</span>
      </div>
    </div>
  );
};

export default PlanningUnitAreaSize;
