import React, { useState } from 'react';

import { Button } from 'components/button/component';
import Icon from 'components/icon';
import Table from 'components/table';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

import { SolutionsTableProps } from './types';

export const SolutionsTable: React.FC<SolutionsTableProps> = ({
  bestSolutionId,
  body,
  onSelectSolution,
}: SolutionsTableProps) => {
  const [selectedRowId, setSelectedRowId] = useState<string>(null);

  const solutionsArrayWithBestProperty = body.map((obj) => {
    if (obj.id === bestSolutionId) {
      return ({ ...obj, best: true });
    }
    return ({ ...obj, best: false });
  });

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

  const BestCell = (value) => {
    return (
      <>
        {value && (<Icon className="w-3 h-3 text-gray-500" icon={STAR_SVG} />)}
      </>
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
      body={solutionsArrayWithBestProperty}
      selectedRowId={selectedRowId}
    />
  );
};

export default SolutionsTable;
