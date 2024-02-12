import { useCallback, useState, ChangeEvent, useEffect, ComponentProps, useMemo } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setSelectedFeatures as setVisibleFeatures,
  setSelectedContinuousFeatures,
  setLayerSettings,
} from 'store/slices/projects/[id]';

import Fuse from 'fuse.js';

import { useAllFeatures, useColorFeatures } from 'hooks/features';

import Icon from 'components/icon';
import ActionsMenu from 'layout/project/sidebar/project/inventory-panel/features/actions-menu';
import FeaturesBulkActionMenu from 'layout/project/sidebar/project/inventory-panel/features/bulk-action-menu';
import { Feature } from 'types/api/feature';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const {
    selectedFeatures: visibleFeatures,
    selectedContinuousFeatures,
    search,
    layerSettings,
  } = useAppSelector((state) => state['/projects/[id]']);

  const [filters, setFilters] = useState<Parameters<typeof useAllFeatures>[1]>({
    sort: FEATURES_TABLE_COLUMNS[0].name,
  });
  const [selectedFeaturesIds, setSelectedFeaturesIds] = useState<Feature['id'][]>([]);
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const featureColors = useColorFeatures(pid, sid);

  const allFeaturesQuery = useAllFeatures(
    pid,
    {
      ...{
        ...filters,
        includeInProgress: true,
        // ? if tag sorting is chosen, sort by tag and then by name
        ...(['tag', '-tag'].includes(filters.sort) && {
          sort: `${filters.sort},featureClassName`,
        }),
      },
      search,
    },
    {
      select: ({ data }) => {
        return data?.map((feature) => {
          const { color } = featureColors?.find(({ id }) => feature.id === id) || {};

          return {
            id: feature.id,
            name: feature.featureClassName,
            scenarios: feature.scenarioUsageCount,
            tag: feature.tag,
            isCustom: feature.isCustom,
            color,
            amountRange: feature.amountRange,
            isFeature: true,
            creationStatus: feature.creationStatus,
            // ! keep for testing. Remove once done.
            // creationStatus: 'created',
            // creationStatus: 'running',
            // creationStatus: 'failure',
          };
        });
      },
      placeholderData: { data: [] },
      keepPreviousData: true,
      enabled: featureColors.length > 0,
    }
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
      const binaryFeatures = [...visibleFeatures];
      const continuousFeatures = [...selectedContinuousFeatures];
      const isIncludedInBinary = binaryFeatures.includes(featureId);
      const isIncludedInContinuous = continuousFeatures.includes(featureId);

      const feature = allFeaturesQuery.data?.find(({ id }) => featureId === id);
      const isContinuous = feature.amountRange.min !== null && feature.amountRange.max !== null;

      if (isContinuous) {
        if (!isIncludedInContinuous) {
          continuousFeatures.push(featureId);
        } else {
          const i = continuousFeatures.indexOf(featureId);
          continuousFeatures.splice(i, 1);
        }

        dispatch(setSelectedContinuousFeatures(continuousFeatures));
      } else {
        if (!isIncludedInBinary) {
          binaryFeatures.push(featureId);
        } else {
          const i = binaryFeatures.indexOf(featureId);
          binaryFeatures.splice(i, 1);
        }

        dispatch(setVisibleFeatures(binaryFeatures));
      }

      const selectedFeature = allFeaturesQuery.data.find(({ id }) => featureId === id);

      dispatch(
        setLayerSettings({
          id: featureId,
          settings: {
            visibility: !(isIncludedInBinary || isIncludedInContinuous),
            color: selectedFeature.color,
            ...(isContinuous && {
              amountRange: feature.amountRange,
            }),
          },
        })
      );
    },
    [dispatch, visibleFeatures, allFeaturesQuery.data, selectedContinuousFeatures]
  );

  const handleSelectTag = useCallback(
    (tag: Parameters<ComponentProps<typeof InventoryTable>['onSelectTag']>[0]) => {
      setSelectedTag(tag);
      setSelectedFeaturesIds([]);
    },
    []
  );

  const clearTag = useCallback(() => {
    setSelectedTag(null);
  }, []);

  const displayBulkActions = selectedFeaturesIds.length > 0;

  const data: DataItem[] = useMemo(() => {
    let d = allFeaturesQuery.data?.map((feature) => ({
      ...feature,
      isVisibleOnMap: layerSettings[feature.id]?.visibility ?? false,
    }));

    if (selectedTag) {
      const fuse = new Fuse(d, {
        keys: ['tag'],
        threshold: 0.25,
      });

      d = fuse.search(selectedTag).map((f) => {
        return f.item;
      });
    }

    return d;
  }, [allFeaturesQuery.data, layerSettings, selectedTag]);

  const handleSelectAll = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const allSelectableFeatues = allFeaturesQuery.data
        ?.filter(({ isCustom, creationStatus }) => isCustom && creationStatus !== 'running')
        .map(({ id }) => id);

      setSelectedFeaturesIds(evt.target.checked ? allSelectableFeatues : []);
    },
    [allFeaturesQuery.data]
  );

  useEffect(() => {
    if (allFeaturesQuery.isRefetching) {
      setSelectedFeaturesIds([]);
    }
  }, [allFeaturesQuery.isRefetching]);

  return (
    <div className="flex flex-col space-y-4 overflow-hidden">
      {selectedTag && (
        <span className="space-x-2 text-xs">
          <span>Filtering by: </span>
          <button
            type="button"
            className="inline-block rounded-2xl bg-yellow-500 bg-opacity-20 px-3 py-0.5 text-yellow-500 transition-colors hover:bg-yellow-600 hover:text-gray-900"
            onClick={clearTag}
          >
            {selectedTag}
          </button>
          <button
            type="button"
            className="group inline-flex justify-center rounded-full border border-gray-700 p-1.5 transition-colors hover:border-white"
            onClick={clearTag}
          >
            <Icon
              icon={CLOSE_SVG}
              className="inline-block h-2 w-2 text-white transition-colors group-hover:text-white"
            />
          </button>
        </span>
      )}
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
          onSelectTag={handleSelectTag}
          ActionsComponent={ActionsMenu}
        />
      </div>
      {displayBulkActions && <FeaturesBulkActionMenu selectedFeaturesIds={selectedFeaturesIds} />}
    </div>
  );
};

export default InventoryPanelFeatures;
