import { ReactElement } from 'react';

export interface TableHeaderItem {
  id: string,
  label: string,
  customCell?: ((customCellProps: CustomCellProps) => ReactElement)
  | ReactElement;
  customSort?: (a: any, b: any) => number;
  defaultSort?: HeaderSelection;
}

export interface CustomCellProps {
  value: any;
  data: TableRow;
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

export interface TableRow {
  id: string,
  isSelected?: boolean
}

export interface TableProps {
  headers: TableHeaderItem[];
  body: TableRow[];
  selectedIndex?: number;
  rowSelectable?: boolean;
  onRowSelected?: (row: TableRow) => void;
  className?: string;
}
