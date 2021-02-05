import React, { useState } from 'react';
import cx from 'classnames';

export interface LabelValue {
  label: string;
  value: Object;
}

export interface TableDataItem extends LabelValue {
  selectable: boolean
}

export interface TableHeaderItem extends LabelValue {
  selectable: boolean
}

export interface TableRow {
  id: string
}

export interface TableProps {
  headers: TableHeaderItem[],
  body: TableRow[],
  rowSelectable: boolean,
  cellSelectable: boolean,
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  body,
  rowSelectable,
  cellSelectable,
  className,
}: TableProps) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  return (
    <table
      className={cx({
        '': true,
        [className]: !!className,
      })}
      role="grid"
    >
      <thead>
        {headers.map((header) => <th key={`header-${header.value}`}>{header.label}</th>)}
      </thead>
      <tbody>
        {body.map((row, rowIndex) => {
          const rowIsSelected = selectedRow === row.id;
          return (
            <tr
              key={row.id}
              className={cx({
                'bg-gray-100': (!rowIsSelected || cellSelectable) && (rowIndex + 1) % 2 === 0,
                'bg-primary-500': rowIsSelected && !cellSelectable,
                'hover:cursor-pointer': rowSelectable,
              })}
              onClick={() => setSelectedRow(row.id)}
            >
              {
                Object.keys(row).filter((key) => key !== 'id').map((propertyKey) => {
                  const { value, label } = row[propertyKey];
                  const cellIsSelected = selectedCell === value
                    && selectedRow === row.id;
                  const handleCellClick = () => cellSelectable && setSelectedCell(value);
                  return (
                    <td
                      key={`td-${value}`}
                      className={cx({
                        'bg-primary-500': cellIsSelected,
                        'hover:cursor-pointer': cellSelectable,
                      })}
                      onClick={handleCellClick}
                      onKeyPress={handleCellClick}
                      role="gridcell"
                    >
                      {label}
                    </td>
                  );
                })
              }
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
