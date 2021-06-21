import React, { useState } from 'react';

import Table from 'components/table';

import BestCell from './cells/best';
import ViewOnMapCell from './cells/view-on-map/component';

import { SolutionsTableProps } from './types';

export const SolutionsTable: React.FC<SolutionsTableProps> = ({
  body,
}: SolutionsTableProps) => {
  const [selectedRowId, setSelectedRowId] = useState<string>(null);
  return (
    <Table
      headers={[
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
          Cell: <ViewOnMapCell onViewOnMap={(id) => setSelectedRowId(id)} />,
          className: 'w-40',
        },
      ]}
      body={body}
      selectedRowId={selectedRowId}
    />
  );
};

export default SolutionsTable;
