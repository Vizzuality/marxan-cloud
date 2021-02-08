import React, { useCallback, useState } from 'react';
import cx from 'classnames';

export interface LabelValue {
  label: string;
  value: Object;
}

export interface TableHeaderItem {
  id: string,
  label: string,
  customCell?: (data: TableRow) => React.ReactNode | JSX.Element;
}

export interface TableRow {
  id: string,
  isSelected?: boolean
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
        'w-full': true,
        [className]: !!className,
      })}
      role="grid"
    >
      <thead>
        <tr className="bg-white">
          {headers.map((header) => (
            <th
              key={`header-${header.id}`}
              className="px-4 text-left"
            >
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, rowIndex) => {
          const rowIsSelected = selectedRow === row.id;
          return (
            <tr
              key={row.id}
              className={cx({
                'bg-gray-100': (!rowIsSelected || cellSelectable) && (rowIndex + 1) % 2 === 0,
                'bg-white': (!rowIsSelected || cellSelectable) && (rowIndex + 1) % 2 === 1,
                'bg-primary-500': rowIsSelected && !cellSelectable,
                'cursor-pointer': rowSelectable,
              })}
              onClick={() => handleRowClick(row)}
            >
              {
                headers.map(({ id, customCell }) => {
                  const currentCell = row[id];
                  const { value, label } = currentCell;
                  const cellIsSelected = selectedCell === value
                    && selectedRow === row.id;
                  return (
                    <td
                      key={`td-${value}`}
                      className={cx({
                        'bg-primary-500': cellIsSelected,
                        'hover:cursor-pointer': cellSelectable,
                        'px-4 py-2': true,
                      })}
                      onClick={() => cellSelectable && handleCellClick(currentCell)}
                      onKeyPress={() => cellSelectable && handleCellClick(currentCell)}
                      role="gridcell"
                    >
                      {customCell ? customCell({
                        ...currentCell,
                        isSelected: rowIsSelected,
                      })
                        : label}
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
