import { useCallback, useState } from 'react';

import Checkbox from 'components/forms/checkbox';
import Label from 'components/forms/label';
import Loading from 'components/loading';
import { ScrollArea } from 'components/scroll-area';
import { cn } from 'utils/cn';

import HeaderItem from './header-item';
import RowItem from './row-item';
import { TargetsSPFTable } from './types';

const TargetsSPFTable = ({
  loading,
  data,
  noDataMessage,
  columns,
  sorting,
  selectedIds,
  onSortChange,
  onSplitFeature,
  onToggleSeeOnMap,
  onSelectTag,
  onSelectRow,
  onSelectAll,
  onChangeRow,
  onDeleteRow,
  ActionsComponent,
}: TargetsSPFTable): JSX.Element => {
  const noData = !loading && data?.length === 0;
  const [showDetails, setShowDetails] = useState(false);

  const noDataCustom = !loading && data?.every((item) => !item.isCustom);

  const handleShowDetails = useCallback(() => {
    setShowDetails((prevShowDetails) => !prevShowDetails);
  }, [setShowDetails]);

  return (
    <>
      {loading && !data?.length && (
        <div className="relative min-h-[200px]">
          <Loading
            visible={true}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      )}
      {noData && <div className="flex h-[200px] items-center justify-center">{noDataMessage}</div>}
      {!!data?.length && (
        <table className="relative flex h-full w-full flex-col space-y-2 overflow-hidden after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-gray-800 after:via-gray-800">
          <thead className="relative block text-left text-xs font-semibold uppercase before:pointer-events-none before:absolute before:left-0 before:top-full before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-gray-800 before:via-gray-800">
            <tr className="flex w-full items-center px-[10px]">
              <th>
                <Checkbox
                  id="select-all"
                  theme="light"
                  className="block h-4 w-4 checked:bg-blue-500"
                  onChange={onSelectAll}
                  checked={selectedIds.length === data.length}
                  disabled={noDataCustom}
                />
              </th>
              {columns.map((column) => {
                return (
                  <th
                    key={column.name}
                    className={cn({
                      'flex-1 pl-2': true,
                      [column.className]: !!column.className,
                      'flex justify-end': column.name === 'type',
                    })}
                  >
                    <HeaderItem
                      text={column.text}
                      name={column.name}
                      sorting={sorting}
                      onClick={onSortChange}
                    />
                  </th>
                );
              })}
              <th className="flex flex-1 justify-end pl-2">
                <div className="flex space-x-2">
                  <Checkbox
                    id="show-detail"
                    theme="light"
                    className="block h-4 w-4 checked:bg-blue-500"
                    onChange={handleShowDetails}
                  />
                  <Label id="show-detail" className="text-xs normal-case text-white">
                    Show detail
                  </Label>
                </div>
              </th>
            </tr>
          </thead>
          <ScrollArea className="h-full">
            <tbody className="block h-full divide-y divide-gray-600 py-2 align-baseline text-sm">
              {data.map((item) => (
                <RowItem
                  key={item.splitted ? `${item.id}-${item.value}` : `${item.id}`}
                  item={item}
                  selectedIds={selectedIds}
                  onSelectRow={onSelectRow}
                  onSplitFeature={onSplitFeature}
                  onToggleSeeOnMap={onToggleSeeOnMap}
                  showDetails={showDetails}
                  onClickTag={onSelectTag}
                  onChangeRow={onChangeRow}
                  onDeleteFeature={onDeleteRow}
                  ActionsComponent={ActionsComponent}
                />
              ))}
            </tbody>
          </ScrollArea>
        </table>
      )}
    </>
  );
};

export { type DataItem } from './types';

export default TargetsSPFTable;
