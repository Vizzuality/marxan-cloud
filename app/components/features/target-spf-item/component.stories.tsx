import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import TargetSPFItem from './component';
import { TargetSPFItemProps } from './types';

export default {
  title: 'Components/Features/TargetSPF-Item',
  component: TargetSPFItem,
  argTypes: {},
};

const Template: Story<TargetSPFItemProps> = ({ ...args }: TargetSPFItemProps) => (
  <TargetSPFItem {...args} />
);

export const Default = Template.bind({});
Default.args = {
  id: 1,
  isAllTargets: false,
  target: 0.17,
  fpf: 1,
  surface: '30 km²',
  name: 'Inland water',
  onRemove: (value) => console.info('Remove: ', value),
  onChangeTarget: (value) => console.info('Change target', value),
  onChangeFPF: (value) => console.info('Change FPF', value),
};

export const AllTargets = Template.bind({});
AllTargets.args = {
  id: 2,
  isAllTargets: true,
  target: 0.17,
  fpf: 1,
  onRemove: (value) => console.info('Remove: ', value),
  onChangeTarget: (value) => console.info('Change target', value),
  onChangeFPF: (value) => console.info('Change FPF', value),
};
