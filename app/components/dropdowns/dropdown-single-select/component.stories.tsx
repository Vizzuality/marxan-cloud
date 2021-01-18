import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Select, { SingleSelectProps } from './component';

export default {
  title: 'Components/Dropdowns/Single select',
  component: Select,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['dark', 'light'],
      },
    },
    state: {
      control: {
        type: 'select',
        options: ['valid', 'error', 'none'],
      },
    },
  },
};

const Template: Story<SingleSelectProps> = (args) => (
  <div className="relative h-40">
    <Select {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
  disabled: false,
  placeholder: 'Select Scenario',
  clearable: true,
  options: [
    { label: 'scenario 1', value: 'scenario-1' },
    { label: 'scenario 2', value: 'scenario-2' },
    { label: 'scenario 3', value: 'scenario-3', disabled: true },
    { label: 'scenario 4', value: 'scenario-4' },
  ],
  onSelect: (option) => console.info(option),
};
