import Checkbox from 'components/forms/checkbox';
import Loading from 'components/loading';

import HeaderItem from './header-item';
import RowItem from './row-item';
import { InventoryTable } from './types';

const InventoryTable = ({
  loading,
  data,
  noDataMessage,
  columns,
  sorting,
  selectedIds,
  onSortChange,
  onToggleSeeOnMap,
  onSelectRow,
  onSelectAll,
  ActionsComponent,
}: InventoryTable): JSX.Element => {
  const noData = !loading && data?.length === 0;

  return (
    <>
      {loading && !data.length && (
        <div className="relative min-h-[200px]">
          <Loading
            visible={true}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      )}
      {noData && <div className="flex h-[200px] items-center justify-center">{noDataMessage}</div>}
      {!!data?.length && (
        <table className="w-full table-auto space-y-2">
          <thead className="text-left text-xs font-semibold uppercase">
            <tr className="flex w-full items-center pl-1">
              <th>
                <Checkbox
                  id="select-all"
                  theme="light"
                  className="block h-4 w-4 checked:bg-blue-400"
                  onChange={onSelectAll}
                />
              </th>
              <th className="flex-1 pl-2">
                <HeaderItem
                  text={'Name'}
                  name={'name'}
                  columns={columns}
                  sorting={sorting}
                  onClick={onSortChange}
                />
              </th>
              <th className="flex flex-1 justify-start py-2 pl-14">
                <HeaderItem
                  className="justify-center"
                  text={'Type'}
                  name={'tag'}
                  columns={columns}
                  sorting={sorting}
                  onClick={onSortChange}
                />
              </th>
            </tr>
          </thead>
          <tbody className="block max-h-[calc(100vh-430px)] divide-y divide-gray-400 overflow-y-auto overflow-x-hidden pl-1 align-baseline text-sm">
            {data.map((item) => (
              <RowItem
                key={item.id}
                item={item}
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

export { type DataItem } from './types';

export default InventoryTable;
