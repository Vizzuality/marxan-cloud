import React, { MutableRefObject, useCallback, useMemo } from 'react';

import { useInView } from 'react-intersection-observer';

import cx from 'classnames';

import Checkbox from 'components/forms/checkbox';
import Select from 'components/forms/select';
import Icon from 'components/icon';

import SPLIT_SVG from 'svgs/ui/split.svg?sprite';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  description: string;
  tag: 'bioregional' | 'species';

  selected?: boolean;
  onSelected?: (selected: boolean) => void;

  // SPLIT
  splitSelected?: string;
  splitOptions?: { key: string; values: any[]; }[];
  onSplitSelected?: (selected: string) => void;
  splitFeaturesSelected?: {
    id: string;
    fpf?: number;
    target?: number;
  }[];
  splitFeaturesOptions?: Record<string, unknown>[];
  onSplitFeaturesSelected?: (selected: {
    id: string;
    fpf?: number;
    target?: number;
  }[]) => void;

  // INTERSECT
  intersectFeaturesSelected?: {
    label: string;
    value: string;
  }[];
  onRemove?: (value) => void;
  scrollRoot?: MutableRefObject<HTMLDivElement | null>;
}

export const Item: React.FC<ItemProps> = ({
  id,
  name,
  className,
  tag,

  selected,
  onSelected,

  splitSelected,
  splitOptions = [],
  onSplitSelected,

  splitFeaturesSelected,
  splitFeaturesOptions = [],
  onSplitFeaturesSelected,

  scrollRoot,
}: ItemProps) => {
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    ...scrollRoot && {
      root: scrollRoot.current,
    },
  });

  // EVENTS
  const onSelectedChanged = useCallback(
    (e) => {
      if (onSelected) onSelected(e.target.checked);
    },
    [onSelected],
  );

  const onSplitChanged = useCallback(
    (s) => {
      if (onSplitSelected) onSplitSelected(s);
    },
    [onSplitSelected],
  );

  const onSplitFeaturesChanged = useCallback(
    (e) => {
      const newSplitFeaturesSelected = [...splitFeaturesSelected];
      const index = newSplitFeaturesSelected.findIndex((s) => s.id === e.currentTarget.value);

      if (index > -1) {
        newSplitFeaturesSelected.splice(index, 1);
      } else {
        newSplitFeaturesSelected.push({
          id: e.currentTarget.value,
        });
      }

      if (onSplitFeaturesSelected) onSplitFeaturesSelected(newSplitFeaturesSelected);
    },
    [splitFeaturesSelected, onSplitFeaturesSelected],
  );

  const OPTIONS = useMemo(() => {
    return splitOptions.map((s) => ({ label: s.key, value: s.key }));
  }, [splitOptions]);

  // RENDER
  return (
    <div
      ref={ref}
      className={cx({
        'bg-white text-gray-500': true,
        [className]: !!className,
        invisible: !inView,
      })}
    >
      <header
        className={cx({
          'px-4 pt-2 pb-4': true,
        })}
      >
        <div className="flex space-x-3">
          <Checkbox
            theme="light"
            id={`checkbox-${id}`}
            value={`${id}`}
            checked={selected}
            className="block w-4 h-4 mt-1.5 text-green-300 form-checkbox-dark"
            onChange={onSelectedChanged}
          />
          <h2 className="mt-1 text-sm font-heading">{name}</h2>
        </div>

        {tag === 'bioregional' && selected && (
          <div>
            <div className="flex items-center mt-3 tracking-wide font-heading">
              <Icon icon={SPLIT_SVG} className="w-5 h-5 text-green-300" />
              <h4 className="ml-2 text-xs text-gray-500 uppercase">
                You can
                {' '}
                <strong>split</strong>
                {' '}
                this feature into categories
              </h4>
            </div>

            <div className="inline-block mt-2">
              <Select
                theme="light"
                size="s"
                status="none"
                placeholder="Select..."
                clearSelectionActive
                selected={splitSelected}
                options={OPTIONS}
                onChange={onSplitChanged}
              />
            </div>
          </div>
        )}
      </header>

      {tag === 'bioregional' && splitSelected && selected && (
        <ul className="pl-3">
          {splitFeaturesOptions.map((f) => {
            const checked = !splitFeaturesSelected.length
              || splitFeaturesSelected.map((s) => s.id).includes(`${f.value}`);

            return (
              <li
                key={`${f.value}`}
                className="flex items-center pr-2.5 py-2 mt-0.5 relative"
              >
                <div className="absolute top-0 left-0 block w-px h-full bg-green-300" />
                <div className="relative flex text-xs font-heading">
                  <div className="ml-2.5">
                    <Checkbox
                      theme="light"
                      id={`checkbox-${f.value}`}
                      value={`${f.value}`}
                      checked={checked}
                      className="block w-4 h-4 text-green-300 form-checkbox-dark"
                      onChange={onSplitFeaturesChanged}
                    />
                  </div>

                  <label
                    htmlFor={`checkbox-${f.value}`}
                    className="inline-block max-w-sm ml-2.5"
                  >
                    {f.label}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Item;
