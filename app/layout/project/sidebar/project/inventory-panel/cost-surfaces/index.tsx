import { useState, useCallback, useEffect, ChangeEvent, useMemo } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setLayerSettings,
  setSelectedCostSurface as setVisibleCostSurface,
} from 'store/slices/projects/[id]';

import { orderBy } from 'lodash';

import { useProjectCostSurfaces } from 'hooks/cost-surface';

import ActionsMenu from 'layout/project/sidebar/project/inventory-panel/cost-surfaces/actions-menu';
import CostSurfacesBulkActionMenu from 'layout/project/sidebar/project/inventory-panel/cost-surfaces/bulk-action-menu';
import { CostSurface } from 'types/api/cost-surface';

import InventoryTable, { type DataItem } from '../components/inventory-table';

const COST_SURFACE_TABLE_COLUMNS = [
  {
    name: 'name',
    text: 'Name',
  },
];

const InventoryPanelCostSurface = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  const dispatch = useAppDispatch();
  const {
    selectedCostSurface: visibleCostSurface,
    search,
    layerSettings,
  } = useAppSelector((state) => state['/projects/[id]']);

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const [selectedCostSurfaceIds, setSelectedCostSurfaceIds] = useState<CostSurface['id'][]>([]);
  const [filters, setFilters] = useState<Parameters<typeof useProjectCostSurfaces>[1]>({
    sort: COST_SURFACE_TABLE_COLUMNS[0].name,
  });

  const allProjectCostSurfacesQuery = useProjectCostSurfaces<
    Omit<CostSurface & Pick<DataItem, 'isCustom'>, 'isDefault'>[]
  >(
    pid,
    {
      ...filters,
    },
    {
      select: (data) =>
        data
          .filter(({ isDefault }) => !isDefault)
          .map((cs) => ({
            ...cs,
            isCustom: !cs.isDefault,
          })),
      keepPreviousData: true,
      placeholderData: [],
    }
  );

  const filteredData = useMemo(() => {
    if (!allProjectCostSurfacesQuery.data.length) return allProjectCostSurfacesQuery.data;
    let sortedData = allProjectCostSurfacesQuery.data;

    switch (filters.sort) {
      case 'name':
        sortedData = orderBy(allProjectCostSurfacesQuery.data, 'name', 'asc');
        break;
      case '-name':
        sortedData = orderBy(allProjectCostSurfacesQuery.data, 'name', 'desc');
        break;
    }

    if (search) {
      return sortedData.filter((cs) =>
        cs.name.toLocaleLowerCase().includes(search?.toLocaleLowerCase())
      );
    }

    return sortedData;
  }, [filters, allProjectCostSurfacesQuery.data, search]);

  const costSurfaceIds = filteredData?.map((cs) => cs.id);

  const handleSelectAll = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setSelectedCostSurfaceIds(evt.target.checked ? costSurfaceIds : []);
    },
    [costSurfaceIds]
  );

  const handleSelectCostSurface = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setSelectedCostSurfaceIds((prevSelectedCostSurface) => [
        ...prevSelectedCostSurface,
        evt.target.value,
      ]);
    } else {
      setSelectedCostSurfaceIds((prevSelectedCostSurface) =>
        prevSelectedCostSurface.filter((costSurfaceId) => costSurfaceId !== evt.target.value)
      );
    }
  }, []);

  useEffect(() => {
    setSelectedCostSurfaceIds([]);
  }, [search]);

  const toggleSeeOnMap = useCallback(
    (costSurfaceId: CostSurface['id']) => {
      costSurfaceIds.forEach((id) => {
        dispatch(
          setLayerSettings({
            id,
            settings: {
              visibility: id !== costSurfaceId ? false : !layerSettings[costSurfaceId]?.visibility,
            },
          })
        );
      });

      if (costSurfaceId === visibleCostSurface) {
        dispatch(setVisibleCostSurface(null));
      } else {
        dispatch(setVisibleCostSurface(costSurfaceId));
      }
    },
    [dispatch, visibleCostSurface, layerSettings, costSurfaceIds]
  );

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

  const displayBulkActions = selectedCostSurfaceIds.length > 0;

  const data: DataItem[] = filteredData?.map((cs) => ({
    ...cs,
    name: cs.name,
    scenarios: cs.scenarioUsageCount,
    isCustom: cs.isCustom,
    isVisibleOnMap: visibleCostSurface === cs.id,
  }));

  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="h-full overflow-hidden">
        <InventoryTable
          loading={allProjectCostSurfacesQuery.isFetching}
          data={data}
          noDataMessage={noDataMessage}
          columns={COST_SURFACE_TABLE_COLUMNS}
          sorting={filters.sort}
          selectedIds={selectedCostSurfaceIds}
          onSortChange={handleSort}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectCostSurface}
          onToggleSeeOnMap={toggleSeeOnMap}
          ActionsComponent={ActionsMenu}
        />
      </div>
      {displayBulkActions && (
        <CostSurfacesBulkActionMenu selectedCostSurfacesIds={selectedCostSurfaceIds} />
      )}
    </div>
  );
};

export default InventoryPanelCostSurface;
