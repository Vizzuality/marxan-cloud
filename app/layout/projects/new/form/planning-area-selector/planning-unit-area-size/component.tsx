import React, { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { useNumberFormatter } from '@react-aria/i18n';

import Input from 'components/forms/input';
import Label from 'components/forms/label';
import InfoButton from 'components/info-button';

import { PlanningUnitAreaSizeProps } from './types';

export const PlanningUnitAreaSize: React.FC<PlanningUnitAreaSizeProps> = ({
  input,
}: PlanningUnitAreaSizeProps) => {
  const { minPuAreaSize, maxPuAreaSize } = useSelector((state) => state['/projects/new']);

  useEffect(() => {
    if (minPuAreaSize) {
      const newSize = +parseInt(minPuAreaSize, 10);

      requestAnimationFrame(() => {
        input.onChange(newSize);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPuAreaSize]);

  const { format } = useNumberFormatter({
    style: 'decimal',
  });

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center">
          <Label theme="dark" className="mr-2 text-xxs uppercase">
            Planning unit area size
          </Label>
          <InfoButton>
            <span>
              <h4 className="mb-2.5 font-heading text-lg">Planning unit size</h4>
              <div className="space-y-2">
                <p>
                  Select a size that is relevant to your planning area and to the resolution of the
                  features you are considering in the study.
                </p>
                <p>
                  For example, small areas with detailed species or ecosystems information typically
                  have small planning unit sizes (below 1km
                  <sup>2</sup>) while whole country studies with broader species information
                  generally have larger planning unit sizes of 5 km
                  <sup>2</sup> or 10 km
                  <sup>2</sup>.
                </p>
                <p>
                  The platform provides a recommended planning unit area size based on extent of the
                  planning area selected
                </p>
              </div>
            </span>
          </InfoButton>
        </div>
      </div>

      <div className="flex items-baseline">
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

      {minPuAreaSize && maxPuAreaSize && (
        <p className="mt-2 text-xs opacity-50">{`Going below ${format(
          minPuAreaSize
        )} km2 could cause performance issues`}</p>
      )}
    </div>
  );
};

export default PlanningUnitAreaSize;
