import { useCallback, useState, ChangeEvent, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setSelectedFeatures as setVisibleFeatures,
  setLayerSettings,
} from 'store/slices/projects/[id]';

import { useAllFeatures } from 'hooks/features';

import ActionsMenu from 'layout/project/sidebar/project/inventory-panel/features/actions-menu';
import FeaturesBulkActionMenu from 'layout/project/sidebar/project/inventory-panel/features/bulk-action-menu';
import { Feature } from 'types/api/feature';

import InventoryTable, { type DataItem } from '../components/inventory-table';

const FEATURES_TABLE_COLUMNS = [
  {
    name: 'featureClassName',
    text: 'Name',
  },
  {
    name: 'tag',
    text: 'Type',
    className: 'flex flex-1 justify-start py-2 pl-14',
  },
];

const InventoryPanelFeatures = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  const dispatch = useAppDispatch();

  const { selectedFeatures: visibleFeatures, search } = useAppSelector(
    (state) => state['/projects/[id]']
  );

  const [filters, setFilters] = useState<Parameters<typeof useAllFeatures>[1]>({
    sort: FEATURES_TABLE_COLUMNS[0].name,
  });
  const [selectedFeaturesIds, setSelectedFeaturesIds] = useState<Feature['id'][]>([]);
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const allFeaturesQuery = useAllFeatures(
    pid,
    {
      ...filters,
      search,
    },
    {
      select: ({ data }) =>
        data?.map((feature) => ({
          id: feature.id,
          name: feature.featureClassName,
          scenarios: feature.scenarioUsageCount,
          tag: feature.tag,
          isCustom: feature.isCustom,
        })),
      placeholderData: { data: [] },
      keepPreviousData: true,
    }
  );

  const featureIds = allFeaturesQuery.data?.map((feature) => feature.id);

  const handleSelectAll = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setSelectedFeaturesIds(evt.target.checked ? featureIds : []);
    },
    [featureIds]
  );

  const handleSelectFeature = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setSelectedFeaturesIds((prevSelectedFeatures) => [...prevSelectedFeatures, evt.target.value]);
    } else {
      setSelectedFeaturesIds((prevSelectedFeatures) =>
        prevSelectedFeatures.filter((featureId) => featureId !== evt.target.value)
      );
    }
  }, []);

  const handleSort = useCallback(
    (_sortType: (typeof filters)['sort']) => {
      const sort = filters.sort === _sortType ? `-${_sortType}` : _sortType;
      setFilters((prevFilters) => ({
        ...prevFilters,
        sort,
      }));
    },
    [filters.sort]
  );

  useEffect(() => {
    setSelectedFeaturesIds([]);
  }, [search]);

  const toggleSeeOnMap = useCallback(
    (featureId: Feature['id']) => {
      const newSelectedFeatures = [...visibleFeatures];
      if (!newSelectedFeatures.includes(featureId)) {
        newSelectedFeatures.push(featureId);

        dispatch(
          setLayerSettings({
            id: featureId,
            settings: {
              visibility: true,
            },
          })
        );
      } else {
        const i = newSelectedFeatures.indexOf(featureId);
        newSelectedFeatures.splice(i, 1);
      }
      dispatch(setVisibleFeatures(newSelectedFeatures));
    },
    [dispatch, visibleFeatures]
  );

  const displayBulkActions = selectedFeaturesIds.length > 0;

  const data: DataItem[] = allFeaturesQuery.data?.map((feature) => ({
    ...feature,
    isVisibleOnMap: visibleFeatures.includes(feature.id),
  }));

  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="h-full overflow-hidden">
        <InventoryTable
          loading={allFeaturesQuery.isFetching}
          data={data}
          noDataMessage={noDataMessage}
          columns={FEATURES_TABLE_COLUMNS}
          sorting={filters.sort}
          selectedIds={selectedFeaturesIds}
          onSortChange={handleSort}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectFeature}
          onToggleSeeOnMap={toggleSeeOnMap}
          ActionsComponent={ActionsMenu}
        />
      </div>
      {displayBulkActions && <FeaturesBulkActionMenu selectedFeaturesIds={selectedFeaturesIds} />}
    </div>
  );
};

export default InventoryPanelFeatures;
