import { useCallback, useState, ChangeEvent, useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedFeatures as setVisibleFeatures } from 'store/slices/projects/[id]';

import { useAllFeatures } from 'hooks/features';

import { Feature } from 'types/api/feature';

import InventoryTable from '../../components/inventory-table';
import ActionsMenu from '../actions-menu';
import FeaturesBulkActionMenu from '../bulk-action-menu';

const FeaturesTable = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  const dispatch = useAppDispatch();

  const { selectedFeatures: visibleFeatures, search } = useAppSelector(
    (state) => state['/projects/[id]']
  );

  const [filters, setFilters] = useState<Parameters<typeof useAllFeatures>[1]>({
    sort: 'featureClassName',
  });
  const [selectedFeaturesIds, setSelectedFeaturesIds] = useState<Feature['id'][]>([]);
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const allFeaturesQuery = useAllFeatures<Feature[]>(
    pid,
    {
      ...filters,
      search,
    },
    {
      select: ({ data }) => data,
      placeholderData: { data: [] },
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
      } else {
        const i = newSelectedFeatures.indexOf(featureId);
        newSelectedFeatures.splice(i, 1);
      }
      dispatch(setVisibleFeatures(newSelectedFeatures));
    },
    [dispatch, visibleFeatures]
  );

  const displayBulkActions = selectedFeaturesIds.length > 0;

  const tableColumns = useMemo(
    () => ({
      name: 'featureClassName',
      tag: 'tag',
    }),
    []
  );

  const tableData = useMemo(
    () =>
      allFeaturesQuery?.data?.map((entry) => ({
        id: entry.id,
        name: entry.featureClassName,
        scenarios: entry.scenarioUsageCount,
        tag: entry.tag,
        isCustom: entry.isCustom,
      })),
    [allFeaturesQuery?.data]
  );

  return (
    <>
      <InventoryTable
        loading={allFeaturesQuery.isFetching}
        data={tableData}
        noDataMessage={noDataMessage}
        columns={tableColumns}
        sorting={filters?.sort}
        selectedIds={selectedFeaturesIds}
        visibleFeatures={visibleFeatures}
        onSortChange={handleSort}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectFeature}
        onToggleSeeOnMap={toggleSeeOnMap}
        ActionsComponent={ActionsMenu}
      />
      {displayBulkActions && <FeaturesBulkActionMenu selectedFeaturesIds={selectedFeaturesIds} />}
    </>
  );
};

export default FeaturesTable;
