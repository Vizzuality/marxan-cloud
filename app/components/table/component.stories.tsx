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
  data: {
    headers: [
      {
        label: 'Header A',
        value: 'a',
      },
      {
        label: 'Header B',
        value: 'b',
      },
    ],
    rows: [
      {
        items: [{ label: 'Row 1 Value 1', value: 1 }, { label: 'Row 1 Value 2', value: 2 }],
        id: 'row1',
      },
      {
        id: 'row2',
        items: [{ label: 'Row 2 Value 1', value: 3 }, { label: 'Row 2 Value 2', value: 4 }],
      },
    ],
  },
};
