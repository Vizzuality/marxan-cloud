import { ChangeEvent } from 'react';

import { Feature } from 'types/api/feature';
import { WDPA } from 'types/api/wdpa';

export type DataItem = {
  id: string;
  attributes?: Omit<WDPA, 'id'>;
  name: string;
  scenarioUsageCount: Feature['scenarioUsageCount'];
  tag?: Feature['tag'];
  isVisibleOnMap: boolean;
  isCustom?: boolean;
  type: Feature['tag'];
  marxanSettings: Record<'prop' | 'spf', number>;
  splitOptions: { key: string; label: string; values: { id: string; name: string }[] }[];
  value?: string;
};

export type TargetsSPFTable = {
  loading: boolean;
  data: DataItem[];
  noDataMessage: string;
  columns: {
    name: string;
    text: string;
    className?: string;
  }[];
  sorting: string;
  selectedIds: Feature['id'][];
  onSortChange: (field: string) => void;
  onSplitFeature?: (id: Feature['id']) => void;
  onSelectTag: (tag: string) => void;
  onToggleSeeOnMap: (id: Feature['id']) => void;
  onSelectRow: (evt: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll: (evt: ChangeEvent<HTMLInputElement>) => void;
  onDeleteRow: (featureId: Feature['id']) => void;
  onChangeRow: (featureId: Feature['id'], values: Record<'prop' | 'spf', number>) => void;
  ActionsComponent: ({ item }) => JSX.Element;
};
