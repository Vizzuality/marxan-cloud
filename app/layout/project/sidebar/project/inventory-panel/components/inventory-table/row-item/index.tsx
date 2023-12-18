import { useCallback, useRef, useState } from 'react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onDismissMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <tr key={id} className="flex w-full py-1 align-top">
      <td className="py-2 pr-1">
        <Checkbox
          id={`select-${id}`}
          theme="light"
          className="mt-0.5 block h-4 w-4 checked:bg-blue-500"
          onChange={onSelectRow}
          value={id}
          checked={isCustom && selectedIds.includes(id)}
          disabled={!isCustom}
        />
      </td>
      <td
        className={cn({
          'flex flex-col px-1 py-2': true,
          'w-52': tag,
        })}
      >
        <span className="inline-flex break-all">{name}</span>
        {isCustom && (
          <div className="mt-1.5 text-xs text-gray-400">
            Currently in use in{' '}
            <span className="rounded bg-blue-600 bg-opacity-10 px-1 text-blue-600">
              {scenarios}
            </span>{' '}
            scenarios.
          </div>
        )}
      </td>
      {tag && (
        <td className="w-28 px-6 py-2 text-xs">
          <div className="flex justify-center">
            <span className="whitespace-nowrap rounded-full bg-yellow-700 bg-opacity-10 px-2 py-1 text-yellow-700">
              {tag}
            </span>
          </div>
        </td>
      )}
      <td className="w-22 ml-auto py-2 pl-1 pr-2">
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

          <Popover open={isMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn({
                  'h-5 w-5': true,
                  invisible: !isCustom,
                })}
                ref={buttonRef}
                onClick={() => {
                  setIsMenuOpen((prevState) => !prevState);
                }}
              >
                <HiDotsHorizontal className="pointer-events-none h-4 w-4 text-white" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              hideWhenDetached
              className="w-auto rounded-2xl border-transparent p-0"
              side="bottom"
              sideOffset={5}
              align="start"
              onInteractOutside={(evt) => {
                if (evt.target !== buttonRef.current) {
                  setIsMenuOpen(false);
                }
              }}
            >
              <ActionsComponent item={item} onDismissMenu={onDismissMenu} />
            </PopoverContent>
          </Popover>
        </div>
      </td>
    </tr>
  );
};

export { type RowItem } from './types';

export default RowItem;
