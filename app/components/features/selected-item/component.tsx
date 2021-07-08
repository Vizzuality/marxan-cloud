import React, { useCallback, useMemo } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import Button from 'components/button';
import Select from 'components/forms/select';
import Checkbox from 'components/forms/checkbox';

import SPLIT_SVG from 'svgs/ui/split.svg?sprite';
import INTERSECT_SVG from 'svgs/ui/intersect.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  description: string;
  type: 'bioregional' | 'species';

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
  onIntersectSelected?: (id: string) => void;
  onRemove?: (value) => void
}

export const Item: React.FC<ItemProps> = ({
  id,
  name,
  className,
  description,
  type,

  splitSelected,
  splitOptions = [],
  onSplitSelected,

  splitFeaturesSelected,
  splitFeaturesOptions = [],
  onSplitFeaturesSelected,

  intersectFeaturesSelected = [],

  onIntersectSelected,
  onRemove,
}: ItemProps) => {
  // EVENTS
  const onSplitChanged = useCallback(
    (selected) => {
      if (onSplitSelected) onSplitSelected(selected);
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

  const onIntersectChanged = useCallback(
    (selected) => {
      if (onIntersectSelected) onIntersectSelected(selected);
    },
    [onIntersectSelected],
  );

  const OPTIONS = useMemo(() => {
    return splitOptions.map((s) => ({ label: s.key, value: s.key }));
  }, [splitOptions]);

  // RENDER
  return (
    <div
      className={cx({
        'bg-gray-700 text-white': true,
        [className]: !!className,
      })}
    >
      <header
        className={cx({
          'px-4 pt-2 pb-4 border-l-4': true,
          'border-green-300': type === 'bioregional',
          'border-yellow-300': type === 'species',
        })}
      >
        <div className="flex items-start justify-between">
          <h2 className="mt-1 text-sm font-heading">{name}</h2>

          <Button
            className="flex-shrink-0 text-xs"
            theme="secondary"
            size="xs"
            onClick={() => onRemove && onRemove(id)}
          >
            Remove
          </Button>

        </div>
        <div className="mt-2 text-sm opacity-50 clamp-2">{description}</div>

        {type === 'bioregional' && (
          <div>
            <div className="flex items-center mt-3 tracking-wide font-heading">
              <Icon icon={SPLIT_SVG} className="w-5 h-5 text-green-300" />
              <h4 className="ml-2 text-xs text-white uppercase">
                You can
                {' '}
                <strong>split</strong>
                {' '}
                this feature into categories
              </h4>
            </div>

            <div className="inline-block mt-2">
              <Select
                theme="dark"
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

        {type === 'species' && (
          <div>
            <div className="flex items-center mt-3 tracking-wide font-heading">
              <Icon icon={INTERSECT_SVG} className="w-5 h-5 text-yellow-300" />
              <h4 className="ml-2 text-xs text-white uppercase">
                You can
                {' '}
                <strong>intersect</strong>
                {' '}
                this feature with others
              </h4>
            </div>

            <div className="inline-block mt-2">
              <Button
                theme="secondary-alt"
                size="s"
                onClick={() => {
                  onIntersectChanged(id);
                }}
              >
                <div className="flex items-center">
                  <span>Select features</span>

                  <Icon icon={PLUS_SVG} className="w-3 h-3 ml-3" />
                </div>
              </Button>
            </div>
          </div>
        )}
      </header>

      {type === 'bioregional' && splitSelected && (
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

      {type === 'species' && intersectFeaturesSelected && !!intersectFeaturesSelected.length && (
        <ul className="pl-3">
          {intersectFeaturesSelected.map((f) => {
            return (
              <li
                key={`${f.value}`}
                className="flex items-center pr-2.5 py-2 mt-0.5 relative"
              >
                <div className="absolute top-0 left-0 block w-px h-full bg-gradient-to-b from-green-300 to-yellow-300" />
                <div className="relative flex text-xs font-heading">
                  <div className="inline-block max-w-sm ml-2.5">
                    {name}
                    {' '}
                    in
                    {' '}
                    {f.label}
                  </div>
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
