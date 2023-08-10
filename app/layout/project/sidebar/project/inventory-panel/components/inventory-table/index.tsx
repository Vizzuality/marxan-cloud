import { ChangeEvent } from 'react';

import { MoreHorizontal } from 'lucide-react';

import Checkbox from 'components/forms/checkbox';
import Icon from 'components/icon';
import Loading from 'components/loading';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import { cn } from 'utils/cn';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

import HeaderItem from './header-item';

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
            {data?.map((item) => {
              const { id, name, scenarios, tag } = item;
              const visibleOnMap = visibleFeatures.includes(id);

              return (
                <tr key={id} className="border-b border-gray-400">
                  <td className="pb-2 pr-1 pt-5">
                    <Checkbox
                      id={`select-${id}`}
                      theme="light"
                      className="-mb-0.5 block h-4 w-4 checked:bg-blue-400"
                      onChange={onSelectRow}
                      value={id}
                      checked={selectedIds.includes(id)}
                    />
                  </td>
                  <td className="px-1 pb-2 pt-5">
                    <div>{name}</div>
                    <div className="mt-1.5 text-xs text-gray-300">
                      Currently in use in {/* TODO Simao: Replace with <Tag /> component */}
                      <span className="rounded bg-blue-500 bg-opacity-10 px-1 text-blue-500">
                        {scenarios}
                      </span>{' '}
                      scenarios.
                    </div>
                  </td>
                  <td className="px-6 pb-2 pt-5 text-xs">
                    {tag && (
                      <div className="flex justify-center">
                        <span className="whitespace-nowrap rounded-full bg-yellow-600 bg-opacity-10 px-2 pb-1 pt-0.5 text-yellow-600">
                          {tag}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="pb-2 pl-1 pt-5">
                    <div className="flex gap-6">
                      <button type="button" onClick={() => onToggleSeeOnMap(id)}>
                        <Icon
                          className={cn({
                            'h-5 w-5': true,
                            'text-gray-400': !visibleOnMap,
                            'text-blue-400': visibleOnMap,
                          })}
                          icon={visibleOnMap ? SHOW_SVG : HIDE_SVG}
                        />
                      </button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="h-5 w-5">
                            <MoreHorizontal className="h-4 w-4 text-white" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto rounded-2xl border-transparent p-0"
                          side="bottom"
                          sideOffset={5}
                          align="start"
                        >
                          <ActionsComponent item={item} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
};

export default InventoryTable;
