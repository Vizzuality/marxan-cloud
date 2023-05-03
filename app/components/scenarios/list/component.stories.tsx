import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import List, { ListProps } from './component';

export default {
  title: 'Components/Scenarios/List',
  component: List,
  argTypes: {},
};

const Template: Story<ListProps> = ({ ...args }: ListProps) => <List {...args} />;

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      id: 1,
      name: 'Scenario 1',
      status: 'running',
      progress: 43,
      updatedAt: '2019-04-11T10:20:30Z',
    },
    {
      id: 2,
      name: 'Scenario 2',
      status: 'completed',
      updatedAt: '2020-04-11T10:20:30Z',
    },
    {
      id: 3,
      name: 'Scenario 3',
      status: 'draft',
      updatedAt: '2020-12-23T10:20:30Z',
    },
    {
      id: 4,
      name: 'Mount Gorongosa',
      status: 'draft',
      updatedAt: '2020-09-23T10:20:30Z',
      warnings: true,
    },
    {
      id: 5,
      name: 'Illas Cies',
      status: 'draft',
      updatedAt: '2020-12-23T10:20:30Z',
    },
  ],
};
