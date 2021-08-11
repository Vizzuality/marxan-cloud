import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import ShowTargetSPFItem from './component';
import { ShowTargetSPFItemProps, Type } from './types';

export default {
  title: 'Components/Features/ShowTargetSPF-Item',
  component: ShowTargetSPFItem,
  argTypes: {},
};

const Template: Story<ShowTargetSPFItemProps> = ({ ...args }: ShowTargetSPFItemProps) => (
  <ShowTargetSPFItem {...args} />
);

export const Default = Template.bind({});
Default.args = {
  id: 1,
  isAllTargets: false,
  target: 17,
  fpf: 1,
  type: Type.BIOREGIONAL,
  name: 'Inland water',
};

export const AllTargets = Template.bind({});
AllTargets.args = {
  id: 2,
  isAllTargets: true,
  target: 50,
  fpf: 1,
};
