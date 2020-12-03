import React from 'react';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import { composeValidators } from 'components/forms/validations';

export default {
  title: 'Components/Forms',
  component: Field,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {},
};

export const Form = (): React.ReactNode => {
  return (
    <FormRFF
      onSubmit={(props) => {
        console.log(props);
      }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit} autoComplete="off">
          <div>
            <FieldRFF name="name" validate={composeValidators([{ presence: true }])}>
              {(props) => (
                <Field label="Name" {...props}>
                  <Input />
                </Field>
              )}
            </FieldRFF>
          </div>
          <div className="mt-5">
            <FieldRFF name="email" validate={composeValidators([{ presence: true, email: true }])}>
              {(props) => (
                <Field label="Email" {...props}>
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
