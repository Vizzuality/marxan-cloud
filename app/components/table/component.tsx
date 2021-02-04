import React from 'react';
import cx from 'classnames';

export interface TableDataItem {
  label: string;
  value: Object;
}

export interface TableHeaderItem {
  label: string;
  value: Object;
}

export interface TableRow {
  id: string,
  items: TableDataItem[]
}

export interface TableData {
  headers: TableHeaderItem[],
  rows: TableRow[]
}

export interface TableProps {
  data: TableData;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  data,
  className,
}: TableProps) => (
  <table
    className={cx({
      '': true,
      [className]: !!className,
    })}
  >
    <thead>
      {data.headers.map((header) => <th key={`header-${header.value}`}>{header.label}</th>)}
    </thead>
    <tbody>
      {data.rows.map((row) => (
        <tr key={row.id}>
          {
                        row.items.map((item) => <td key={`td-${item.value}`}>{item.label}</td>)
                    }
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
