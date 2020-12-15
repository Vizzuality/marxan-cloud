import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Label from 'components/forms/label';
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
    <Label className="mb-3 uppercase">Name the scenario</Label>
    <Input />
  </Field>
);

export const Default = Template.bind({});
Default.args = {
  id: 'scenario',
  input: {},
  meta: {
    touched: true,
    error: true,
  },
};
