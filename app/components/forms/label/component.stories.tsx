import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Input from 'components/forms/input';
import Label, { LabelProps } from './component';

export default {
  title: 'Components/Forms/Label',
  component: Label,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['dark'],
      },
    },
  },
};

const Template: Story<LabelProps> = (args) => (
  <Label {...args}>
    <Input />
  </Label>
);

export const Default = Template.bind({});
Default.args = {
  id: 'scenario',
  label: 'Name the scenario',
  theme: 'dark',
};
