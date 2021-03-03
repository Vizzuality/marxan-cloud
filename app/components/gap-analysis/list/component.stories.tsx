import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import List, { ListProps } from './component';

export default {
  title: 'Components/GapAnalysis/List',
  component: List,
  argTypes: {},
};

const Template: Story<ListProps> = ({ ...args }) => (
  <List {...args} />
);

export const Default: Story<ListProps> = Template.bind({});
Default.args = {
  items: [
    {
      name: 'Lion in Deserts and Xeric Shrublands',
      current: {
        percent: 0.05,
        value: 22,
        unit: 'km²',
      },
      target: {
        percent: 0.17,
        value: 30,
        unit: 'km²',
      },
      onMap: false,
      onToggleOnMap: (onMap) => console.log(onMap),
    },
    {
      name: 'Lion in Flooded Grasslands and Savannas',
      current: {
        percent: 0.1,
        value: 22,
        unit: 'km²',
      },
      target: {
        percent: 0.17,
        value: 25,
        unit: 'km²',
      },
      onMap: true,
      onToggleOnMap: (onMap) => console.log(onMap),
    },
    {
      name: 'Cheetah',
      current: {
        percent: 0.15,
        value: 18,
        unit: 'km²',
      },
      target: {
        percent: 0.17,
        value: 30,
        unit: 'km²',
      },
      onMap: true,
      onToggleOnMap: (onMap) => console.log(onMap),
    },
  ],
};
