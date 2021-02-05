import React, { useCallback, useState } from 'react';
import cx from 'classnames';

export interface LabelValue {
  label: string;
  value: Object;
}

export interface TableHeaderItem extends LabelValue {
  selectable: boolean
}

export interface TableRow {
  id: string
}

export interface TableProps {
  headers: TableHeaderItem[];
  body: TableRow[];
  rowSelectable?: boolean;
  cellSelectable?: boolean;
  onRowSelected?: (row: TableRow) => void;
  onCellSelected?: (cell: LabelValue) => void;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  body,
  rowSelectable,
  cellSelectable,
  onRowSelected,
  onCellSelected,
  className,
}: TableProps) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleRowClick = useCallback((row) => {
    setSelectedRow(row.id);
    if (onRowSelected) onRowSelected(row);
  }, [onRowSelected]);

  const handleCellClick = useCallback((cell) => {
    setSelectedCell(cell.value);
    if (onCellSelected) onCellSelected(cell);
  }, [onCellSelected]);

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
              onClick={() => handleRowClick(row)}
            >
              {
                Object.keys(row).filter((key) => key !== 'id').map((propertyKey) => {
                  const currentCell = row[propertyKey];
                  const { value, label } = currentCell;
                  const cellIsSelected = selectedCell === value
                    && selectedRow === row.id;
                  return (
                    <td
                      key={`td-${value}`}
                      className={cx({
                        'bg-primary-500': cellIsSelected,
                        'hover:cursor-pointer': cellSelectable,
                      })}
                      onClick={() => cellSelectable && handleCellClick(currentCell)}
                      onKeyPress={() => cellSelectable && handleCellClick(currentCell)}
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
