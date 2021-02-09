import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
import Button from 'components/button';
import Icon from 'components/icon';
import STAR_SVG from 'svgs/ui/star.svg?sprite';
import Table from './component';
import { TableProps } from './types';

export default {
  title: 'Components/Table',
  component: Table,
  argTypes: {},
};

const Template: Story<TableProps> = ({ ...args }: TableProps) => {
  const [selectedRowId, setSelectedRowId] = useState('row1');

  const BestCell = (value) => {
    if (value) return <Icon className="w-3 h-3" icon={STAR_SVG} />;
    return '';
  };

  const ViewOnMapCell = (value, row) => {
    const { isSelected } = row;

    return (
      <Button
        theme="secondary-alt"
        size="s"
        className="flex justify-center w-full"
        onClick={() => {
          setSelectedRowId(row.id);
        }}
      >
        {isSelected ? 'Selected' : 'Select solution'}
      </Button>
    );
  };

  const headers = [
    {
      label: 'Best',
      id: 'best',
      Cell: BestCell,
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
      Cell: ViewOnMapCell,
      className: 'w-40',
    },
  ];

  const body = [
    {
      run: 1,
      score: 170,
      cost: 168,
      'view-on-map': false,
      best: false,
      id: 'row1',
    },
    {
      run: 2,
      score: 150,
      cost: 48,
      'view-on-map': false,
      best: false,
      id: 'row2',
    },
    {
      run: 3,
      score: 110,
      cost: 18,
      'view-on-map': false,
      best: true,
      id: 'row3',
    },
    {
      run: 4,
      score: 140,
      cost: 188,
      'view-on-map': false,
      best: false,
      id: 'row4',
    },
  ];

  return (
    <Table
      {...args}
      headers={headers}
      body={body}
      selectedRowId={selectedRowId}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
};
