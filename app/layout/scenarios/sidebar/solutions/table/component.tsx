import React, { useState } from 'react';

import Table from 'components/table';
import { Button } from 'components/button/component';

import BestCell from './cells/best';

import { SolutionsTableProps } from './types';

export const SolutionsTable: React.FC<SolutionsTableProps> = ({
  body,
  onSelectSolution,
}: SolutionsTableProps) => {
  const [selectedRowId, setSelectedRowId] = useState<string>(null);

  const ViewOnMapCell = (value, row) => {
    const { isSelected } = row;

    return (
      <Button
        theme={isSelected ? 'secondary' : 'secondary-alt'}
        size="s"
        className="flex justify-center w-full"
        onClick={() => {
          setSelectedRowId(row.id);
          onSelectSolution(row);
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
      label: 'Planning Units',
      id: 'planningUnits',
    },
    {
      label: 'Missing Values',
      id: 'missingValues',
    },
    {
      label: 'View on map',
      id: 'view-on-map',
      Cell: ViewOnMapCell,
      className: 'w-40',
    },
  ];

  return (
    <Table
      headers={headers}
      body={body}
      selectedRowId={selectedRowId}
    />
  );
};

export default SolutionsTable;
