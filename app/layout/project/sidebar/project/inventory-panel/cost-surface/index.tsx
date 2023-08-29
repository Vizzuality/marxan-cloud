import { useState, useCallback, useEffect, ChangeEvent } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedCostSurfaces as setVisibleCostSurfaces } from 'store/slices/projects/[id]';

import { useProjectCostSurfaces } from 'hooks/cost-surface';

import ActionsMenu from 'layout/project/sidebar/project/inventory-panel/features/actions-menu';
import FeaturesBulkActionMenu from 'layout/project/sidebar/project/inventory-panel/features/bulk-action-menu';
import { CostSurface } from 'types/api/cost-surface';

import InventoryTable, { type DataItem } from '../components/inventory-table';

const COST_SURFACE_TABLE_COLUMNS = {
  name: 'Name',
};

const InventoryPanelCostSurface = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedCostSurfaces: visibleCostSurfaces, search } = useAppSelector(
    (state) => state['/projects/[id]']
  );

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const [selectedCostSurfaceIds, setSelectedCostSurfaceIds] = useState<CostSurface['id'][]>([]);
  const [filters, setFilters] = useState<Parameters<typeof useProjectCostSurfaces>[1]>({
    sort: COST_SURFACE_TABLE_COLUMNS.name,
  });

  const allProjectCostSurfacesQuery = useProjectCostSurfaces(
    pid,
    {
      ...filters,
      search,
    },
    {
      select: (data) =>
        data?.map((cs) => ({
          id: cs.id,
          name: cs.name,
          scenarioUsageCount: cs.scenarioUsageCount,
        })),
      keepPreviousData: true,
      placeholderData: [],
    }
  );

  const costSurfaceIds = allProjectCostSurfacesQuery.data?.map((cs) => cs.id);

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
      const newSelectedCostSurfaces = [...visibleCostSurfaces];
      if (!newSelectedCostSurfaces.includes(costSurfaceId)) {
        newSelectedCostSurfaces.push(costSurfaceId);
      } else {
        const i = newSelectedCostSurfaces.indexOf(costSurfaceId);
        newSelectedCostSurfaces.splice(i, 1);
      }
      dispatch(setVisibleCostSurfaces(newSelectedCostSurfaces));
    },
    [dispatch, visibleCostSurfaces]
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

  const data: DataItem[] = allProjectCostSurfacesQuery.data?.map((wdpa) => ({
    ...wdpa,
    name: wdpa.name,
    scenarios: wdpa.scenarioUsageCount,
    isVisibleOnMap: visibleCostSurfaces?.includes(wdpa.id),
  }));

  return (
    <div className="space-y-6">
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
      {displayBulkActions && (
        <FeaturesBulkActionMenu selectedFeaturesIds={selectedCostSurfaceIds} />
      )}
    </div>
  );
};

export default InventoryPanelCostSurface;
