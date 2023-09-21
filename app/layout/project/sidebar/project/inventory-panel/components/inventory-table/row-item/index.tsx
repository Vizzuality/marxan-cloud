import { HiDotsHorizontal } from 'react-icons/hi';

import Checkbox from 'components/forms/checkbox';
import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import { cn } from 'utils/cn';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

import { RowItem } from './types';

const RowItem = ({
  item,
  selectedIds,
  onSelectRow,
  onToggleSeeOnMap,
  ActionsComponent,
}: RowItem) => {
  const { id, name, scenarios, tag, isVisibleOnMap, isCustom } = item;

  return (
    <tr key={id} className="flex w-full align-top">
      <td className="pb-2 pr-1 pt-5">
        <Checkbox
          id={`select-${id}`}
          theme="light"
          className="block h-4 w-4 checked:bg-blue-500"
          onChange={onSelectRow}
          value={id}
          checked={isCustom && selectedIds.includes(id)}
          disabled={!isCustom}
        />
      </td>
      <td
        className={cn({
          'flex flex-col px-1 pb-2 pt-5': true,
          'w-52': tag,
        })}
      >
        <span className="inline-flex">{name}</span>
        <div className="mt-1.5 text-xs text-gray-400">
          Currently in use in
          <span className="rounded bg-blue-600 bg-opacity-10 px-1 text-blue-600">
            {scenarios}
          </span>{' '}
          scenarios.
        </div>
      </td>
      {tag && (
        <td className="w-28 px-6 pb-2 pt-5 text-xs">
          <div className="flex justify-center">
            <span className="whitespace-nowrap rounded-full bg-yellow-700 bg-opacity-10 px-2 py-1 text-yellow-700">
              {tag}
            </span>
          </div>
        </td>
      )}
      <td className="w-22 ml-auto pb-2 pl-1 pr-2 pt-5">
        <div className="flex gap-6">
          <button type="button" onClick={() => onToggleSeeOnMap(id)}>
            <Icon
              className={cn({
                'h-5 w-5 text-gray-600': true,
                'text-blue-500': isVisibleOnMap,
              })}
              icon={isVisibleOnMap ? SHOW_SVG : HIDE_SVG}
            />
          </button>
          {isCustom && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn({
                    'h-5 w-5': true,
                    invisible: !isCustom,
                  })}
                >
                  <HiDotsHorizontal className="h-4 w-4 text-white" />
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
          )}
        </div>
      </td>
    </tr>
  );
};

export { type RowItem } from './types';

export default RowItem;
