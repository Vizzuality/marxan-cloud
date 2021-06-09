import React, { useState } from 'react';
import { Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import {
  composeValidators,
} from 'components/forms/validations';

import { PlanningArea } from 'types/project-model';
import { PlanningAreaSelectorProps } from './types';

import CountryRegionSelector from './country-region-selector';
import PlanningUnitGrid from './planning-unit-grid';
import PlanningUnitAreaSize from './planning-unit-area-size';

export const PlanningAreaSelector: React.FC<PlanningAreaSelectorProps> = ({
  area,
  values,
  onChange,
}: PlanningAreaSelectorProps) => {
  const [data, setData] = useState<PlanningArea>(area);
  const { planningUnitAreakm2, planningUnitGridShape } = data;

  const { countryId, adminAreaLevel1Id, adminAreaLevel2Id } = values;

  return (
    <div>
      <CountryRegionSelector
        country={countryId}
        region={adminAreaLevel1Id}
        subRegion={adminAreaLevel2Id}
      />

      <div className="flex">
        <div className="flex w-1/2">
          <FieldRFF
            name="planningUnitGridShape"
            validate={composeValidators([{ presence: true }])}
          >
            {(fprops) => (
              <Field id="planningUnitGridShape" {...fprops}>
                <PlanningUnitGrid
                  unit={planningUnitGridShape}
                  onChange={(value) => {
                    const newData = {
                      ...data,
                      planningUnitGridShape: value,
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
            validate={composeValidators([{
              presence: true,
              numericality: {
                onlyInteger: true,
                greaterThan: 0,
              },
            }])}
          >
            {(fprops) => (
              <Field id="planningUnitAreakm2" {...fprops}>
                <PlanningUnitAreaSize
                  size={planningUnitAreakm2}
                  onChange={(value) => {
                    const newData = {
                      ...data,
                      planningUnitAreakm2: value,
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
