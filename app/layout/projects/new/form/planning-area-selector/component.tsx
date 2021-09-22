import React from 'react';

import { Field as FieldRFF } from 'react-final-form';
import { useSelector } from 'react-redux';

import PlanningUnitAreaSize from 'layout/projects/new/form/planning-area-selector/planning-unit-area-size';
import PlanningUnitGrid from 'layout/projects/new/form/planning-area-selector/planning-unit-grid';

import Field from 'components/forms/field';
import {
  composeValidators,
} from 'components/forms/validations';
import InfoButton from 'components/info-button';

import { PlanningAreaSelectorProps } from './types';

export const PlanningAreaSelector: React.FC<PlanningAreaSelectorProps> = ({
  values,
}: PlanningAreaSelectorProps) => {
  const {
    countryId,
    planningUnitGridShape,
    planningAreaId,
  } = values;

  const {
    minPuAreaSize,
    maxPuAreaSize,
  } = useSelector((state) => state['/projects/new']);

  return (
    <div>
      {(!!countryId || !!planningAreaId) && (
        <div className="flex items-center mt-6 space-x-2">
          <h2 className="text-lg font-medium font-heading">Add a planning unit grid</h2>
          <InfoButton>
            <span>
              <h4 className="font-heading text-lg mb-2.5">Planning unit grid</h4>
              <div className="flex flex-col justify-between mt-3 space-y-2">
                <p>
                  The planning area needs to be divided
                  into smaller spatial units, called planning units.
                </p>
                <p>
                  Planning units are the building blocks of any conservation
                  or zoning plan. They convert the world into smaller more
                  manageable pieces that can be treated separately from
                  one another, similar to a jigsaw puzzle.
                  Each planning unit contains information about
                  their corresponding location on Earth.
                </p>
                <p>
                  The planning units are central to a
                  Marxan analysis and choosing an appropriate
                  shape and size is important.
                </p>
              </div>
            </span>
          </InfoButton>
        </div>
      )}

      {(!!countryId || !!planningAreaId) && (
        <div className="flex mt-5">
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
