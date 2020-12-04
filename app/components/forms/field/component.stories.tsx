import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Input from 'components/forms/input';
import Field, { FieldProps } from './component';

export default {
  title: 'Components/Forms/Field',
  component: Field,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    input: {
      control: {
        disable: true,
      },
    },
    meta: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<FieldProps> = (args) => (
  <Field {...args}>
    <Input />
  </Field>
);

export const Default = Template.bind({});
Default.args = {
  id: 'scenario',
  label: 'Name the scenario',
  input: {},
  meta: {
    touched: true,
    error: true,
  },
};
