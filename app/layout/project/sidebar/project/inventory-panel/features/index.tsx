import { useCallback, useState, ChangeEvent, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setSelectedFeatures as setVisibleFeatures,
  setLayerSettings,
} from 'store/slices/projects/[id]';

import chroma from 'chroma-js';

import { useAllFeatures } from 'hooks/features';
import { COLORS } from 'hooks/map/constants';

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

  const {
    selectedFeatures: visibleFeatures,
    search,
    layerSettings,
  } = useAppSelector((state) => state['/projects/[id]']);

  const [filters, setFilters] = useState<Parameters<typeof useAllFeatures>[1]>({
    sort: FEATURES_TABLE_COLUMNS[0].name,
  });
  const [selectedFeaturesIds, setSelectedFeaturesIds] = useState<Feature['id'][]>([]);
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const allFeaturesQuery = useAllFeatures(
    pid,
    {
      ...{
        ...filters,
        // ? if tag sorting is chosen, sort by tag and then by name
        ...(['tag', '-tag'].includes(filters.sort) && {
          sort: `${filters.sort},featureClassName`,
        }),
      },
      search,
    },
    {
      select: ({ data }) => {
        return data?.map((feature, index) => {
          const color =
            data.length > COLORS['features-preview'].ramp.length
              ? chroma.scale(COLORS['features-preview'].ramp).colors(data.length)[index]
              : COLORS['features-preview'].ramp[index];

          return {
            id: feature.id,
            name: feature.featureClassName,
            scenarios: feature.scenarioUsageCount,
            tag: feature.tag,
            isCustom: feature.isCustom,
            color,
          };
        });
      },
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
      const isIncluded = newSelectedFeatures.includes(featureId);
      if (!isIncluded) {
        newSelectedFeatures.push(featureId);
      } else {
        const i = newSelectedFeatures.indexOf(featureId);
        newSelectedFeatures.splice(i, 1);
      }
      dispatch(setVisibleFeatures(newSelectedFeatures));

      const selectedFeature = allFeaturesQuery.data.find(({ id }) => featureId === id);
      const { color } = selectedFeature || {};

      dispatch(
        setLayerSettings({
          id: featureId,
          settings: {
            visibility: !isIncluded,
            color,
          },
        })
      );
    },
    [dispatch, visibleFeatures, allFeaturesQuery.data]
  );

  const displayBulkActions = selectedFeaturesIds.length > 0;

  const data: DataItem[] = allFeaturesQuery.data?.map((feature) => ({
    ...feature,
    isVisibleOnMap: layerSettings[feature.id]?.visibility ?? false,
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
