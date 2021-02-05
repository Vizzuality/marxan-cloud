import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Table, { TableProps } from './component';

export default {
  title: 'Components/Table',
  component: Table,
  argTypes: {},
};

const Template: Story<TableProps> = ({ ...args }: TableProps) => (
  <Table {...args} />
);

export const Default = Template.bind({});
Default.args = {
  headers: [
    {
      label: 'Run',
      value: 'run',
    },
    {
      label: 'Score',
      value: 'score',
    },
    {
      label: 'Cost',
      value: 'cost',
    },
  ],
  body: [
    {
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      id: 'row1',
    },
    {
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      id: 'row2',
    },
    {
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      id: 'row3',
    },
    {
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      id: 'row4',
    },
  ],
  rowSelectable: true,
  cellSelectable: false,
};
