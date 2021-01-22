import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import DropdownMultiSelect, { MultiSelectProps } from './component';

export default {
  title: 'Components/Dropdowns/Multi select',
  component: DropdownMultiSelect,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    options: {
      description: 'Array of options to be displayed on the dropdown. Option interface allows for this properties: label, value, disabled and hideCheckbox',
    },
    theme: {
      description: 'Controls the visual aspect of the dropdown',
    },
    state: {
      description: 'When embedded into forms, this state could be defined after validation',
    },
    disabled: {
      description: 'Defines the interactivity of the component. No interaction is possible when this option is set to true',
    },
    placeholder: {
      description: 'String to be displayed on the dropdown toggle when no option is selected',
    },
    batchSelectionActive: {
      description: 'Defines wether options for selecting and removing all the elements in the dropdown should be present',
    },
  },
};

const Template: Story<MultiSelectProps> = (args) => (
  <div className="relative h-60">
    <DropdownMultiSelect {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
  size: 'base',
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
  onChange: (option, selectedItems) => console.info(option, selectedItems),
};
