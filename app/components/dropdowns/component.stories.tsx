import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Dropdown from './component';
import { DropdownProps } from './types';

export default {
  title: 'Components/Dropdowns/Default',
  component: Dropdown,
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
    onSelect: {
      table: {
        disable: true,
      },
    },
    initialValues: {
      table: {
        disable: true,
      },
    },
  },
};

const Template: Story<DropdownProps> = (args) => (
  <div className="relative">
    <Dropdown {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
  size: 'base',
  status: 'none',
  prefix: 'FILTER BY:',
  placeholder: 'Select Scenario',
  options: [
    { label: 'Scenario 1', value: 'scenario-1' },
    { label: 'Scenario 2', value: 'scenario-2' },
    { label: 'Scenario 3', value: 'scenario-3', disabled: true },
    { label: 'Scenario 4', value: 'scenario-4' },
  ],
  initialSelected: ['scenario-1', 'scenario-2', 'scenario-4'],
  disabled: false,
  multiple: true,
  searchable: false,
  clearSelectionActive: true,
  clearSelectionLabel: 'Clear Selection',
  batchSelectionActive: true,
  batchSelectionLabel: 'Select all',
  onChange: (option) => console.info(option),
};
