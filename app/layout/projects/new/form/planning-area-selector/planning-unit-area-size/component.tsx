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
    <div>
      <div className="space-y-3">
        <div className="flex items-center">
          <Label theme="dark" className="mr-2 uppercase text-xxs">Planning unit area size</Label>
          <InfoButton>
            <span>
              <h4 className="font-heading text-lg mb-2.5">Planning unit size</h4>
              <div className="space-y-2">
                <p>
                  Select a size that is relevant to your planning area
                  and to the resolution of the features you are considering
                  in the study.
                </p>
                <p>
                  For example, small areas with detailed species
                  or ecosystems information typically have small planning
                  unit sizes (below 1km
                  <sup>2</sup>
                  ) while whole country studies with
                  broader species information generally have larger planning
                  unit sizes of 5 km
                  <sup>2</sup>
                  {' '}
                  or 10 km
                  <sup>2</sup>
                  .
                </p>
                <p>
                  The platform
                  provides a recommended planning unit area size based on
                  extent of the
                  planning area selected
                </p>
              </div>
            </span>
          </InfoButton>
        </div>
        <p className="text-sm opacity-50">{`Going below ${+parseInt(minPuAreaSize, 10)} km2 or above ${+parseInt(maxPuAreaSize, 10)} km2 could cause performance issues`}</p>
      </div>

      <div className="flex items-baseline mt-4">
        <div className="w-full">
          <Input
            {...input}
            mode="dashed"
            className="text-2xl"
            type="number"
            onChange={(event) => input.onChange(+parseInt(event.target.value, 10))}
          />
        </div>
        <span>KM2</span>
      </div>
    </div>
  );
};

export default PlanningUnitAreaSize;
