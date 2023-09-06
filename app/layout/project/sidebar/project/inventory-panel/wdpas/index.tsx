import { useState, useCallback, useEffect, ChangeEvent } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedWDPAs as setVisibleWDPAs } from 'store/slices/projects/[id]';

import { useProjectWDPAs } from 'hooks/wdpa';

import { WDPA } from 'types/api/wdpa';

import InventoryTable, { type DataItem } from '../components/inventory-table';

import ActionsMenu from './actions-menu';
import WDPABulkActionMenu from './bulk-action-menu';

const WDPA_TABLE_COLUMNS = [
  {
    name: 'fullName',
    text: 'Name',
  },
];

const InventoryPanelProtectedAreas = ({
  noData: noDataMessage,
}: {
  noData: string;
}): JSX.Element => {
  const dispatch = useAppDispatch();

  const { selectedWDPAs: visibleWDPAs, search } = useAppSelector(
    (state) => state['/projects/[id]']
  );

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const [selectedWDPAIds, setSelectedWDPAIds] = useState<WDPA['id'][]>([]);
  const [filters, setFilters] = useState<Parameters<typeof useProjectWDPAs>[1]>({
    sort: WDPA_TABLE_COLUMNS[0].name,
  });

  const allProjectWDPAsQuery = useProjectWDPAs(
    pid,
    {
      ...filters,
      search,
    },
    {
      select: (data) =>
        data?.map((wdpa) => ({
          id: wdpa.id,
          attributes: wdpa.attributes,
        })),
      keepPreviousData: true,
      placeholderData: [],
    }
  );

  const WDPAIds = allProjectWDPAsQuery.data?.map((wdpa) => wdpa.id);

  const handleSelectAll = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setSelectedWDPAIds(evt.target.checked ? WDPAIds : []);
    },
    [WDPAIds]
  );

  const handleSelectWDPA = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setSelectedWDPAIds((prevSelectedWDPAs) => [...prevSelectedWDPAs, evt.target.value]);
    } else {
      setSelectedWDPAIds((prevSelectedWDPAs) =>
        prevSelectedWDPAs.filter((wdpaId) => wdpaId !== evt.target.value)
      );
    }
  }, []);

  useEffect(() => {
    setSelectedWDPAIds([]);
  }, [search]);

  const toggleSeeOnMap = useCallback(
    (WDPAId: WDPA['id']) => {
      const newSelectedWDPAs = [...visibleWDPAs];
      if (!newSelectedWDPAs.includes(WDPAId)) {
        newSelectedWDPAs.push(WDPAId);
      } else {
        const i = newSelectedWDPAs.indexOf(WDPAId);
        newSelectedWDPAs.splice(i, 1);
      }
      dispatch(setVisibleWDPAs(newSelectedWDPAs));
    },
    [dispatch, visibleWDPAs]
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

  const displayBulkActions = selectedWDPAIds.length > 0;

  const data: DataItem[] = allProjectWDPAsQuery.data?.map((wdpa) => ({
    ...wdpa,
    name: wdpa.attributes.isCustom ? wdpa.attributes.fullName : wdpa.attributes.iucnCategory,
    scenarios: wdpa.attributes.scenarioUsageCount,
    isCustom: wdpa.attributes.isCustom,
    isVisibleOnMap: visibleWDPAs?.includes(wdpa.id),
  }));

  return (
    <div className="space-y-6">
      <InventoryTable
        loading={allProjectWDPAsQuery.isFetching}
        data={data}
        noDataMessage={noDataMessage}
        columns={WDPA_TABLE_COLUMNS}
        sorting={filters.sort}
        selectedIds={selectedWDPAIds}
        onSortChange={handleSort}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectWDPA}
        onToggleSeeOnMap={toggleSeeOnMap}
        ActionsComponent={ActionsMenu}
      />
      {displayBulkActions && <WDPABulkActionMenu selectedWDPAIds={selectedWDPAIds} />}
    </div>
  );
};

export default InventoryPanelProtectedAreas;
