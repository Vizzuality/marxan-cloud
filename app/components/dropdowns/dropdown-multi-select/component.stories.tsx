import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import DropdownMultiSelect, { MultiSelectProps } from './component';

export default {
  title: 'Components/Dropdowns/Multi select',
  component: DropdownMultiSelect,
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

const Template: Story<MultiSelectProps> = (args) => (
  <div className="relative h-60 w-72">
    <DropdownMultiSelect {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
  disabled: false,
  placeholder: 'Select Scenario',
  batchSelectionActive: true,
  batchSelectionLabel: 'Select all',
  clearSelectionLabel: 'Clear selection',
  options: [
    { label: 'IUCN I-II', value: 'IUCN_I-II' },
    { label: 'IUCN I-IV', value: 'IUCN_I-IV' },
    { label: 'IUCN I-V', value: 'IUCN_I-V', disabled: true },
    { label: 'IUCN I-VI', value: 'IUCN_I-VI' },
  ],
  onSelect: (option) => console.info(option),
};
