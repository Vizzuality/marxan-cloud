import React from 'react';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Checkbox from 'components/forms/checkbox';
import { composeValidators } from 'components/forms/validations';

export default {
  title: 'Components/Forms',
  parameters: { actions: { argTypesRegex: '^on.*' } },
};

export const Form = (): React.ReactNode => {
  return (
    <FormRFF
      debug={(values) => {
        console.log(values);
      }}
      onSubmit={() => {
        // console.log(values);
      }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit} autoComplete="off">
          <div>
            <FieldRFF
              name="name"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="form-name" {...fprops}>
                  <Label className="mb-3 uppercase">Name</Label>
                  <Input />
                </Field>
              )}
            </FieldRFF>
          </div>
          <div className="mt-5">
            <FieldRFF
              name="email"
              validate={composeValidators([{ presence: true, email: true }])}
            >
              {(fprops) => (
                <Field id="form-email" {...fprops}>
                  <Label className="mb-3 uppercase">Email</Label>
                  <Input type="email" />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-5">
            <FieldRFF
              name="boolean"
              type="checkbox"
              validate={composeValidators([
                {
                  presence: {
                    message: '^You need to check the checkbox',
                  },
                  inclusion: {
                    within: [true],
                    message: '^You need to check the checkbox',
                  },
                },
              ])}
            >
              {(fprops) => (
                <Field className="flex" id="form-boolean" {...fprops}>
                  <Checkbox />
                  <Label className="ml-2">This is a checkbox</Label>
                </Field>
              )}
            </FieldRFF>
          </div>
        </form>
      )}
    </FormRFF>
  );
};
