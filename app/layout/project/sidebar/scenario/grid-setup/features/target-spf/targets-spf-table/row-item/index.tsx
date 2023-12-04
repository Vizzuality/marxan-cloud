import { useCallback, useRef, useState } from 'react';

import { HiDotsHorizontal } from 'react-icons/hi';

import Checkbox from 'components/forms/checkbox';
import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import { Feature } from 'types/api/feature';
import { cn } from 'utils/cn';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

import { DataItem, TargetsSPFTable } from '../types';

import RowDetails from './details';

const RowItem = ({
  item,
  selectedIds,
  onSelectRow,
  onToggleSeeOnMap,
  showDetails = true,
  onClickTag,
  ActionsComponent,
  onChangeRow,
  onDeleteFeature,
}: {
  item: DataItem;
  selectedIds: Feature['id'][];
  showDetails: boolean;
  onSelectRow: TargetsSPFTable['onSelectRow'];
  onToggleSeeOnMap: TargetsSPFTable['onToggleSeeOnMap'];
  onSplitFeature: TargetsSPFTable['onSplitFeature'];
  onClickTag: (tag: Feature['tag']) => void;
  onChangeRow: TargetsSPFTable['onChangeRow'];
  onDeleteFeature: (featureId: Feature['id']) => void;
  ActionsComponent: ({
    item,
    onDismissMenu,
    onSplitFeature,
    onDeleteFeature,
  }: {
    item: DataItem;
    onDismissMenu: () => void;
    onSplitFeature: (featureId: Feature['id']) => void;
    onDeleteFeature: (featureId: Feature['id']) => void;
  }) => JSX.Element;
}) => {
  const { id, name, scenarios, type, marxanSettings, isVisibleOnMap, isCustom } = item;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [featuresToSplit, setFeaturesToSplit] = useState<Feature['id'][]>([]);

  const onDismissMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleSplitFeature = useCallback((featureId: Feature['id']) => {
    setFeaturesToSplit((prevFeaturesToSplit) =>
      prevFeaturesToSplit.includes(featureId)
        ? prevFeaturesToSplit.filter((id) => id !== featureId)
        : [...prevFeaturesToSplit, featureId]
    );
  }, []);

  const handleFeatureDeletion = useCallback(
    (featureId: Feature['id']) => {
      onDeleteFeature(featureId);
    },
    [onDeleteFeature]
  );

  return (
    <tr key={id} className="flex w-full flex-wrap px-[10px] py-2 align-top">
      <td className="pb-2 pr-1">
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
          'flex flex-col px-1 pb-2': true,
          'w-52': type,
        })}
      >
        <span className="inline-flex">{name}</span>
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
      {type && (
        <td className="w-24 px-6 pb-2 pt-5 text-xs">
          <div className="flex justify-center">
            <button
              type="button"
              className="cursor-pointer whitespace-nowrap rounded-full bg-yellow-700 bg-opacity-10 px-2 py-1 text-yellow-700"
              onClick={() => {
                onClickTag(type);
              }}
            >
              {type}
            </button>
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
              <ActionsComponent
                item={item}
                onDismissMenu={onDismissMenu}
                onSplitFeature={handleSplitFeature}
                onDeleteFeature={handleFeatureDeletion}
              />
            </PopoverContent>
          </Popover>
        </div>
      </td>
      {showDetails && marxanSettings && (
        <td className="mt-2 flex w-full">
          <RowDetails item={item} onChange={onChangeRow} />
        </td>
      )}
      {featuresToSplit.includes(item.id) && <div>Split menu here</div>}
    </tr>
  );
};

export default RowItem;
