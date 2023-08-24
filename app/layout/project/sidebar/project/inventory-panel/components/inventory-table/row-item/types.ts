import { ChangeEvent } from 'react';

import { DataItem } from '../types';

export type RowItem = {
  item: DataItem;
  selectedIds: string[];
  onSelectRow: (evt: ChangeEvent<HTMLInputElement>) => void;
  onToggleSeeOnMap: (id: string) => void;
  ActionsComponent: ({ item }) => JSX.Element;
};
