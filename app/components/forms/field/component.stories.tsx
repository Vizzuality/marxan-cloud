import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Input from 'components/forms/input';
import Field, { FieldProps } from './component';

export default {
  title: 'Components/Forms/Field',
  component: Field,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {},
};

const Template: Story<FieldProps> = (args) => (
  <Field {...args}>
    <Input />
  </Field>
);

export const Default = Template.bind({});
Default.args = {
  name: 'name',
  placeholder: 'Write scenario name',
  label: 'Name the scenario',
  meta: {
    touched: true,
    error: true,
  },
};
