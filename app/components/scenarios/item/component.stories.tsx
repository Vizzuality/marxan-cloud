import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Item, { ItemProps } from './component';

export default {
  title: 'Components/Scenarios/Item',
  component: Item,
  argTypes: {},
};

const Template: Story<ItemProps> = ({ ...args }: ItemProps) => (
  <Item {...args} />
);

export const Default = Template.bind({});
Default.args = {
  name: 'Scenario 1',
  scenarioState: 'running',
  progress: 20,
};
