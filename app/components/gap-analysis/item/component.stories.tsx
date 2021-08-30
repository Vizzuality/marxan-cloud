import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Item, { ItemProps } from './component';

export default {
  title: 'Components/GapAnalysis/Item',
  component: Item,
  argTypes: {},
};

const Template: Story<ItemProps> = ({ ...args }) => (
  <Item {...args} />
);

export const Default: Story<ItemProps> = Template.bind({});
Default.args = {
  id: 'dfasdfasd',
  name: 'Lion in Deserts and Xeric Shrublands',
  current: {
    percent: 0.05,
    value: '22M',
    unit: 'km²',
  },
  target: {
    percent: 0.17,
    value: '30M',
    unit: 'km²',
  },
  onMap: false,
  muted: false,
  onMouseEnter: (e) => console.info(e),
  onMouseLeave: (e) => console.info(e),
};
