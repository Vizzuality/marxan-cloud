import React, { ReactNode } from 'react';

import { Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import {
  composeValidators,
} from 'components/forms/validations';
import InfoButton from 'components/info-button';

export interface ScenariosRunFieldProps {
  id: string;
  label: string;
  description: string | ReactNode;
  input: any;
  note?: string;
  validations?: any;
}

export const ScenariosRunField: React.FC<ScenariosRunFieldProps> = ({
  id,
  label,
  description,
  note,
  input,
  validations,
}: ScenariosRunFieldProps) => {
  return (
    <FieldRFF
      name={id}
      validate={composeValidators(validations)}
    >
      {(fprops) => (
        <div className="">
          <div className="flex items-center">
            <Label theme="light" className="mr-2 text-lg font-heading">{label}</Label>
            <InfoButton>
              <span>{description}</span>
            </InfoButton>
          </div>

          {note && (
            <div className="uppercase text-xxs font-heading">{note}</div>
          )}

          <div className="mt-2">
            <div className="w-full">
              <Field id={id} {...fprops}>
                <Input
                  {...input}
                  theme="light"
                  mode="dashed"
                  onChange={(e) => {
                    if (!e.target.value) {
                      return fprops.input.onChange(null);
                    }
                    return fprops.input.onChange(+e.target.value);
                  }}
                />
              </Field>
            </div>

            {(typeof input.min !== 'undefined' || typeof input.max !== 'undefined') && (
              <div className="flex justify-between w-full">
                <div className="text-xs">
                  min
                  {' '}
                  {input.min}
                </div>

                <div className="text-xs">
                  max
                  {' '}
                  {input.max}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </FieldRFF>
  );
};

export default ScenariosRunField;
