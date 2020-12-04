import React from 'react';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import { composeValidators } from 'components/forms/validations';

export default {
  title: 'Components/Forms',
  parameters: { actions: { argTypesRegex: '^on.*' } },
};

export const Form = (): React.ReactNode => {
  return (
    <FormRFF
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
                <Field id="form-name" label="Name" {...fprops}>
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
                <Field id="form-email" label="Email" {...fprops}>
                  <Input type="email" />
                </Field>
              )}
            </FieldRFF>
          </div>
        </form>
      )}
    </FormRFF>
  );
};
