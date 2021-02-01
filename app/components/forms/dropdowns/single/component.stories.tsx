import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Select, { SingleSelectProps } from './component';

export default {
  title: 'Components/Forms/Single select',
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
  <div className="relative h-60">
    <Select {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
  size: 'base',
  disabled: false,
  placeholder: 'Select Scenario',
  clearable: true,
  prefix: 'FILTER BY:',
  options: [
    { label: 'Scenario 1', value: 'scenario-1' },
    { label: 'Scenario 2', value: 'scenario-2' },
    { label: 'Scenario 3', value: 'scenario-3', disabled: true },
    { label: 'Scenario 4', value: 'scenario-4' },
  ],
  onSelect: (selected) => console.info(selected),
};
