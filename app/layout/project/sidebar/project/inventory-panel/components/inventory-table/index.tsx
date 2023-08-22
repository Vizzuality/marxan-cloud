import { ChangeEvent } from 'react';

import Checkbox from 'components/forms/checkbox';
import Loading from 'components/loading';

import HeaderItem from './header-item';
import RowItem from './row-item';

const InventoryTable = ({
  loading,
  data,
  noDataMessage,
  columns,
  sorting,
  selectedIds,
  visibleFeatures,
  onSortChange,
  onToggleSeeOnMap,
  onSelectRow,
  onSelectAll,
  ActionsComponent,
}: {
  loading: boolean;
  data: {
    id: string;
    name: string;
    scenarios: number;
    tag: string;
  }[];
  noDataMessage: string;
  columns: {
    [key: string]: string;
  };
  sorting: string;
  selectedIds: string[];
  visibleFeatures: string[];
  onSortChange: (field: string) => void;
  onToggleSeeOnMap: (id: string) => void;
  onSelectRow: (evt: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll: (evt: ChangeEvent<HTMLInputElement>) => void;
  ActionsComponent: ({ item }) => JSX.Element;
}): JSX.Element => {
  const noData = !loading && data?.length === 0;

  return (
    <>
      {loading && (
        <div className="relative min-h-[200px]">
          <Loading
            visible={true}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      )}
      {noData && <div className="flex h-[200px] items-center justify-center">{noDataMessage}</div>}
      {!loading && !noData && (
        <table className="w-full table-auto">
          <thead className="text-left text-xs font-semibold uppercase">
            <tr>
              <th className="pb-2 pt-5">
                <Checkbox
                  id="select-all"
                  theme="light"
                  className="block h-4 w-4 checked:bg-blue-400"
                  onChange={onSelectAll}
                />
              </th>
              <th className="w-full">
                <HeaderItem
                  text={'Name'}
                  name={'name'}
                  columns={columns}
                  sorting={sorting}
                  onClick={onSortChange}
                />
              </th>
              <th className="pb-2 pt-5 text-center">
                <HeaderItem
                  className="justify-center"
                  text={'Type'}
                  name={'tag'}
                  columns={columns}
                  sorting={sorting}
                  onClick={onSortChange}
                />
              </th>
              <th className="pb-2 pt-5"></th>
            </tr>
          </thead>
          <tbody className="align-baseline text-sm">
            {data?.map((item) => (
              <RowItem
                key={item.id}
                item={item}
                visibleFeatures={visibleFeatures}
                selectedIds={selectedIds}
                onSelectRow={onSelectRow}
                onToggleSeeOnMap={onToggleSeeOnMap}
                ActionsComponent={ActionsComponent}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default InventoryTable;
