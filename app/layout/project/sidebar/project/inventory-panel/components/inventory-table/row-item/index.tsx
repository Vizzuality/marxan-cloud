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
  onSelectTag,
  ActionsComponent,
}: RowItem) => {
  const { id, name, scenarios, tag, isVisibleOnMap, isCustom, isFeature, creationStatus } = item;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onDismissMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const renderScenarioUsage = useCallback((scenarios: (typeof item)['scenarios']) => {
    return (
      <div className="mt-1.5 text-xs text-gray-400">
        Currently in use in{' '}
        <span className="rounded bg-blue-600 bg-opacity-10 px-1 text-blue-600">{scenarios}</span>{' '}
        scenarios.
      </div>
    );
  }, []);

  const isFeatureRunning = isFeature && creationStatus === 'running';
  const isFeatureFailed = isFeature && creationStatus === 'failure';

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
          disabled={!isCustom || isFeatureRunning}
        />
      </td>
      <td
        className={cn({
          'flex flex-col px-1 pb-2 pt-5': true,
          'w-52': tag,
        })}
      >
        <span className="inline-flex break-all">{name}</span>

        {isFeature && (
          <>
            {isCustom && creationStatus === 'created' && renderScenarioUsage(scenarios)}

            {creationStatus === 'failure' && (
              <div className="mt-1.5 text-xs text-red-600">Feature could not be processed</div>
            )}

            {creationStatus === 'running' && (
              <div className="mt-1.5 text-xs text-gray-400">Feature is being processed...</div>
            )}
          </>
        )}
        {isCustom && !isFeature && renderScenarioUsage(scenarios)}
      </td>
      {tag && (
        <td className="w-28 px-6 pb-2 pt-5 text-xs">
          <div className="flex justify-center">
            <button
              type="button"
              className={cn({
                'whitespace-nowrap rounded-full bg-yellow-600 px-2 py-1 text-gray-900': true,
                'pointer-events-auto': !onSelectTag,
              })}
              onClick={() => onSelectTag?.(tag)}
            >
              {tag}
            </button>
          </div>
        </td>
      )}
      <td className="w-22 ml-auto pb-2 pl-1 pr-2 pt-5">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => onToggleSeeOnMap(id)}
            disabled={isFeatureRunning || isFeatureFailed}
          >
            <Icon
              className={cn({
                'h-5 w-5 text-gray-600': true,
                'text-blue-500': isVisibleOnMap,
                'text-gray-700': isFeatureRunning || isFeatureFailed,
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
                disabled={isFeatureRunning}
              >
                <HiDotsHorizontal
                  className={cn('pointer-events-none h-4 w-4 text-white', {
                    'text-gray-700': isFeatureRunning,
                  })}
                />
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
