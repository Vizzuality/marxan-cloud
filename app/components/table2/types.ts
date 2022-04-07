import { ReactNode } from 'react';

export interface TableProps {
  className?: string;
  headers: TableHeaderItem[];
  body: TableRow[];
  selectedRowId?: string | number;
}
export interface TableHeaderItem {
  id: string,
  label: string,
  Cell?: ((value: any, row: TableRow) => ReactNode);
  customSort?: (a: any, b: any) => number;
  className?: string;
}

export interface TableRow {
  id: string,
  isSelected?: boolean
}

export enum Direction {
  ASC = 'asc',
  DESC = 'desc',
}

export interface HeaderSelection {
  id: string;
  order: Direction;
  customSort?: (a: any, b: any) => number;
}
