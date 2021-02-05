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
      items: [{ label: '1', value: 1 }, { label: '170', value: 170 }, { label: '168.0', value: 168 }],
      id: 'row1',
    },
    {
      id: 'row2',
      items: [{ label: '2', value: 1 }, { label: '130', value: 130 }, { label: '168.0', value: 168 }],
    },
    {
      id: 'row3',
      items: [{ label: '3', value: 1 }, { label: '190', value: 190 }, { label: '208.0', value: 208 }],
    },
    {
      id: 'row4',
      items: [{ label: '4', value: 1 }, { label: '150', value: 150 }, { label: '188.0', value: 188 }],
    },
  ],
  rowSelectable: true,
  cellSelectable: false,
};
