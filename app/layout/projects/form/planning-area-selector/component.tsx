import React, { useState } from 'react';
import { Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import {
  composeValidators,
} from 'components/forms/validations';
import CountryRegionSelector from 'components/countries/country-region-selector';
import PlanningUnitGrid from 'components/projects/planning-unit-grid';
import PlanningUnitAreaSize from 'components/projects/planning-unit-area-size';
import { PlanningArea } from 'types/project-model';

import { PlanningAreaSelectorProps } from './types';

export const PlanningAreaSelector: React.FC<PlanningAreaSelectorProps> = ({
  area,
  onChange,
}: PlanningAreaSelectorProps) => {
  const [data, setData] = useState<PlanningArea>(area);
  const { size, unit } = data;

  return (
    <div>
      <CountryRegionSelector />

      <div className="flex">
        <div className="flex w-1/2">
          <FieldRFF
            name="planningUnitGridShape"
            validate={composeValidators([{ presence: true }])}
          >
            {(fprops) => (
              <Field id="planningUnitGridShape" {...fprops}>
                <PlanningUnitGrid
                  unit={unit}
                  onChange={(value) => {
                    const newData = {
                      ...data,
                      unit: value,
                    };
                    setData(newData);

                    // React Final Form onChange
                    fprops.input.onChange(value);
                    if (onChange) {
                      onChange(newData);
                    }
                  }}
                />
              </Field>
            )}
          </FieldRFF>
        </div>
        <div className="flex w-1/2">
          <FieldRFF
            name="planningUnitAreakm2"
            validate={composeValidators([{ presence: true }])}
          >
            {(fprops) => (
              <Field id="planningUnitAreakm2" {...fprops}>
                <PlanningUnitAreaSize
                  size={size}
                  onChange={(value) => {
                    const newData = {
                      ...data,
                      size: value,
                    };
                    setData(newData);
                    // React Final Form onChange
                    fprops.input.onChange(value);
                    if (onChange) {
                      onChange(newData);
                    }
                  }}
                />
              </Field>
            )}
          </FieldRFF>
        </div>
      </div>
    </div>
  );
};

export default PlanningAreaSelector;
