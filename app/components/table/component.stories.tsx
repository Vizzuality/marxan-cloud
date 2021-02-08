import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Button from 'components/button';
import Icon from 'components/icon';
import STAR_SVG from 'svgs/ui/star.svg?sprite';
import Table from './component';
import { TableProps, TableRow } from './types';

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
      label: 'Best',
      id: 'best',
      customCell: (value) => {
        if (value) return <Icon className="w-3 h-3" icon={STAR_SVG} />;
        return '';
      },
    },
    {
      label: 'RUN',
      id: 'run',
    },
    {
      label: 'Score',
      id: 'score',
    },
    {
      label: 'Cost',
      id: 'cost',
    },
    {
      label: 'View on map',
      id: 'view-on-map',
      customCell: function selectSolutionButton(value, { isSelected } : TableRow) {
        return (
          <Button
            theme="secondary-alt"
            size="s"
            className="flex justify-center w-full"
          >
            {isSelected ? 'Selected' : 'Select solution'}
          </Button>
        );
      },
    },
  ],
  body: [
    {
      run: 1,
      score: 170,
      cost: 168,
      'view-on-map': false,
      best: false,
      id: 'row1',
    },
    {
      run: 1,
      score: 170,
      cost: 168,
      'view-on-map': false,
      best: false,
      id: 'row2',
    },
    {
      run: 1,
      score: 170,
      cost: 168,
      'view-on-map': false,
      best: true,
      id: 'row3',
    },
    {
      run: 1,
      score: 170,
      cost: 168,
      'view-on-map': false,
      best: false,
      id: 'row4',
    },
  ],
  rowSelectable: true,
  cellSelectable: false,
  onRowSelected: (row) => console.info(row),
};
