import React, { useCallback, useState, useEffect } from 'react';
import cx from 'classnames';

import { TableProps } from './types';

export const Table: React.FC<TableProps> = ({
  headers,
  body,
  rowSelectable,
  onRowSelected,
  selectedIndex,
  className,
}: TableProps) => {
  const [selectedRow, setSelectedRow] = useState(selectedIndex);

  useEffect(() => {
    setSelectedRow(selectedIndex);
  }, [selectedIndex]);

  const handleRowClick = useCallback((row, rowIndex) => {
    setSelectedRow(rowIndex);
    if (onRowSelected) onRowSelected(row);
  }, [onRowSelected]);

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
          const rowIsSelected = selectedRow === rowIndex;
          return (
            <tr
              key={row.id}
              className={cx({
                'bg-gray-100': !rowIsSelected && (rowIndex + 1) % 2 === 0,
                'bg-white': !rowIsSelected && (rowIndex + 1) % 2 === 1,
                'bg-primary-500': rowIsSelected,
                'cursor-pointer': rowSelectable,
              })}
              onClick={() => handleRowClick(row, rowIndex)}
            >
              {
                headers.map(({ id, customCell }) => {
                  const value = row[id];
                  return (
                    <td
                      key={`td-${value}`}
                      className="px-4 py-2"
                      role="gridcell"
                    >
                      {customCell ? customCell(value,
                        {
                          ...row,
                          isSelected: rowIsSelected,
                        })
                        : value}
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
