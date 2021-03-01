import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import TargetSPFItem from './component';
import { TargetSPF, TargetSPFItemProps, Type } from './types';

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
  targetSPF: {
    id: 1,
    isAllTargets: false,
    target: 0.17,
    spf: 1,
    type: Type.BIOREGIONAL,
    surface: '30 km²',
    name: 'Inland water',
  },
  onRemove: (value: TargetSPF) => console.info('Remove: ', value),
  onChange: (value: TargetSPF) => console.info('Change', value),
};

export const AllTargets = Template.bind({});
AllTargets.args = {
  targetSPF: {
    id: 2,
    isAllTargets: true,
    target: 0.17,
    spf: 1,
  },
  onRemove: (value: TargetSPF) => console.info('Remove: ', value),
  onChange: (value: TargetSPF) => console.info('Change', value),
};
