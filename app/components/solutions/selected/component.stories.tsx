import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import SelectedSolution, { SelectedSolutionProps } from './component';

export default {
  title: 'Components/Solutions/Selected',
  component: SelectedSolution,
  argTypes: {},
};

const Template: Story<SelectedSolutionProps> = ({ ...args }) => (
  <SelectedSolution {...args} />
);

export const Default: Story<SelectedSolutionProps> = Template.bind({});
Default.args = {
  id: 'dfasdfasd',
  best: true,
  values: {
    runId: 1,
    scoreValue: 999,
    costValue: 400,
    missingValues: 13,
    planningUnits: 17,
  },
  onMap: false,
  onToggleOnMap: (onMap) => console.info(onMap),
};
