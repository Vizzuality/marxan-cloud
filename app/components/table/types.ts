export interface TableHeaderItem {
  id: string,
  label: string,
  customCell?: (value, data: TableRow) => React.ReactNode | JSX.Element;
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
