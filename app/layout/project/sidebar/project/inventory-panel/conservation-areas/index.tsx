import { useState, useCallback, useEffect, ChangeEvent } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedWDPAs as setVisibleWDPAs, setLayerSettings } from 'store/slices/projects/[id]';

import { useProjectWDPAs } from 'hooks/wdpa';

import { WDPA } from 'types/api/wdpa';

import InventoryTable, { type DataItem } from '../components/inventory-table';

import ActionsMenu from './actions-menu';
import WDPABulkActionMenu from './bulk-action-menu';

const WDPA_TABLE_COLUMNS = [
  {
    name: 'name',
    text: 'Name',
  },
];

const ConservationAreasTable = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  const dispatch = useAppDispatch();

  const {
    selectedWDPAs: visibleWDPAs,
    search,
    layerSettings,
  } = useAppSelector((state) => state['/projects/[id]']);

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
      placeholderData: [],
    }
  );

  const WDPAIds = allProjectWDPAsQuery.data?.filter((wdpa) => wdpa.isCustom).map((wdpa) => wdpa.id);

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

  const toggleSeeOnMap = useCallback(
    (WDPAId: WDPA['id']) => {
      const newSelectedWDPAs = [...visibleWDPAs];
      const isIncluded = newSelectedWDPAs.includes(WDPAId);
      if (!isIncluded) {
        newSelectedWDPAs.push(WDPAId);
      } else {
        const i = newSelectedWDPAs.indexOf(WDPAId);
        newSelectedWDPAs.splice(i, 1);
      }
      dispatch(setVisibleWDPAs(newSelectedWDPAs));

      dispatch(
        setLayerSettings({
          id: WDPAId,
          settings: {
            visibility: !isIncluded,
          },
        })
      );
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
    name: wdpa.name,
    scenarios: wdpa.scenarioUsageCount,
    isCustom: wdpa.isCustom,
    isVisibleOnMap: layerSettings[wdpa.id]?.visibility ?? false,
  }));

  useEffect(() => {
    if (allProjectWDPAsQuery.isRefetching) {
      setSelectedWDPAIds([]);
    }
  }, [allProjectWDPAsQuery.isRefetching]);

  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="h-full overflow-hidden">
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
      </div>
      {displayBulkActions && <WDPABulkActionMenu selectedWDPAIds={selectedWDPAIds} />}
    </div>
  );
};

export default ConservationAreasTable;
