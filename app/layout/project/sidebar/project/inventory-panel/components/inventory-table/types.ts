import { ChangeEvent } from 'react';

export type DataItem = {
  id: string;
  name: string;
  scenarios: number;
  tag?: string;
  isVisibleOnMap: boolean;
  isCustom: boolean;
};

export type InventoryTable = {
  loading: boolean;
  data: DataItem[];
  noDataMessage: string;
  columns: {
    name: string;
    text: string;
    className?: string;
  }[];
  sorting: string;
  selectedIds: string[];
  onSortChange: (field: string) => void;
  onToggleSeeOnMap: (id: string) => void;
  onSelectRow: (evt: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll: (evt: ChangeEvent<HTMLInputElement>) => void;
  ActionsComponent: ({ item }) => JSX.Element;
};
