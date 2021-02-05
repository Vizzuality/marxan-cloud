import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Button from 'components/button';
import Icon from 'components/icon';
import STAR_SVG from 'svgs/ui/star.svg?sprite';
import Table, { TableProps, TableRow, LabelValue } from './component';

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
      customCell: (row: LabelValue) => {
        if (row.value) return <Icon className="w-3 h-3" icon={STAR_SVG} />;
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
      customCell: function selectSolutionButton({ isSelected }: TableRow) {
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
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      'view-on-map': { label: '-', value: '-' },
      best: { label: '-', value: false },
      id: 'row1',
    },
    {
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      'view-on-map': { label: '-', value: '-' },
      best: { label: '-', value: false },
      id: 'row2',
    },
    {
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      'view-on-map': { label: '-', value: '-' },
      best: { label: '-', value: true },
      id: 'row3',
    },
    {
      run: { label: '1', value: 1 },
      score: { label: '170', value: 170 },
      cost: { label: '168.0', value: 168 },
      'view-on-map': { label: '-', value: '-' },
      best: { label: '-', value: false },
      id: 'row4',
    },
  ],
  rowSelectable: true,
  cellSelectable: false,
  onRowSelected: (row) => console.info(row),
};
