import React, { useState } from 'react';

import Table from 'components/table';
import { Button } from 'components/button/component';

import BestCell from './cells/best';

import { SolutionsTableProps } from './types';

export const SolutionsTable: React.FC<SolutionsTableProps> = ({
  body,
}: SolutionsTableProps) => {
  const [selectedRowId, setSelectedRowId] = useState<string>(null);

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

  return (
    <Table
      headers={headers}
      body={body}
      selectedRowId={selectedRowId}
    />
  );
};

export default SolutionsTable;
