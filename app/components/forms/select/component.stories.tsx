import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Select, { SelectProps } from './component';

export default {
  title: 'Components/Forms/Select',
  component: Select,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['dark', 'light'],
      },
    },
    status: {
      control: {
        type: 'select',
        options: ['none', 'valid', 'error', 'disabled'],
      },
    },
  },
};

const Template: Story<SelectProps> = (args) => <Select {...args} />;

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
  placeholder: 'Select option',
  options: [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
    { label: 'Option 3', value: 'option-3', disabled: true },
    { label: 'Option 4', value: 'option-4' },
  ],
};
