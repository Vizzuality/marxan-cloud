import React from 'react';
import { Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import {
  composeValidators,
} from 'components/forms/validations';

import { useSelector } from 'react-redux';

import PlanningUnitGrid from 'layout/projects/new/form/planning-unit-grid';
import PlanningUnitAreaSize from 'layout/projects/new/form/planning-unit-area-size';
import CountryRegionSelector from 'layout/projects/new/form/planning-area-selector/country-region-selector';

import { PlanningAreaSelectorProps } from './types';

export const PlanningAreaSelector: React.FC<PlanningAreaSelectorProps> = ({
  values,
}: PlanningAreaSelectorProps) => {
  const {
    countryId,
    adminAreaLevel1Id,
    adminAreaLevel2Id,
    planningUnitGridShape,
  } = values;

  const {
    minPuAreaSize,
    maxPuAreaSize,
  } = useSelector((state) => state['/projects/new']);

  return (
    <div>
      <CountryRegionSelector
        country={countryId}
        region={adminAreaLevel1Id}
        subRegion={adminAreaLevel2Id}
      />

      {!!countryId && (
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
                      // React Final Form onChange
                      fprops.input.onChange(value);
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
                  greaterThanOrEqualTo: +parseInt(minPuAreaSize, 10),
                  lessThanOrEqualTo: +parseInt(maxPuAreaSize, 10),
                },
              }])}
            >
              {({ input }) => (
                <PlanningUnitAreaSize input={input} />
              )}
            </FieldRFF>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningAreaSelector;
