import React, { useCallback } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import Select from 'components/forms/select';
import Checkbox from 'components/forms/checkbox';

import INTERSECT_SVG from 'svgs/ui/intersect.svg?sprite';

export interface ItemProps {
  id: string;
  className?: string;
  name: string;
  description: string;
  type: 'bioregional' | 'species';

  splitSelected: string;
  splitOptions: Record<string, unknown>[];
  onSplitSelected: (selected: string) => void;

  splitFeaturesSelected: string[];
  splitFeaturesOptions: Record<string, unknown>[];
  onSplitFeaturesSelected: (selected: string[]) => void;

  intersectSelected: string[];
  intersectOptions: Record<string, unknown>[];
  onIntersectSelected: (selected: string[]) => void;
}

export const Item: React.FC<ItemProps> = ({
  className,
  name,
  description,
  type,

  splitSelected,
  splitOptions = [],
  onSplitSelected,

  splitFeaturesSelected,
  splitFeaturesOptions = [],
  onSplitFeaturesSelected,

  intersectSelected,
  intersectOptions = [],
  onIntersectSelected,
}: ItemProps) => {
  // EVENTS
  const onSplitChanged = useCallback(
    (e) => {
      onSplitSelected(e.currentTarget.value);
    },
    [onSplitSelected],
  );

  const onSplitFeaturesChanged = useCallback(
    (e) => {
      const newSplitFeaturesSelected = [...splitFeaturesSelected];
      const index = newSplitFeaturesSelected.indexOf(e.currentTarget.value);

      if (index > -1) {
        newSplitFeaturesSelected.splice(index, 1);
      } else {
        newSplitFeaturesSelected.push(e.currentTarget.value);
      }

      onSplitFeaturesSelected(newSplitFeaturesSelected);
    },
    [splitFeaturesSelected, onSplitFeaturesSelected],
  );

  const onIntersectChanged = useCallback(
    (e) => {
      const OPTIONS = [...e.currentTarget.options];
      onIntersectSelected(
        OPTIONS.filter((o) => o.selected).map((o) => o.value),
      );
    },
    [onIntersectSelected],
  );

  // RENDER
  return (
    <div
      className={cx({
        'bg-gray-800 text-white': true,
        [className]: !!className,
      })}
    >
      <header
        className={cx({
          'px-4 pt-2 pb-4 border-l-4': true,
          'border-primary-500': type === 'bioregional',
          'border-yellow-300': type === 'species',
        })}
      >
        <h2 className="text-sm font-heading">{name}</h2>
        <div className="mt-2 text-sm opacity-50 clamp-2">{description}</div>

        {type === 'bioregional' && (
          <div>
            <div className="flex items-center mt-3 tracking-wide font-heading">
              <Icon icon={INTERSECT_SVG} className="w-5 h-5 text-primary-500" />
              <h4 className="ml-2 text-xs text-white uppercase">
                You can select different attributtes to split the feature
              </h4>
            </div>

            {/* TODO: Select from javi!! */}
            <div className="inline-block mt-2">
              <Select
                className="py-0.5 text-sm pr-8"
                placeholder="Select..."
                value={splitSelected}
                options={splitOptions}
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
                You can intersect this feature with others
              </h4>
            </div>

            {/* TODO: Select from javi!! */}
            <div className="inline-block mt-2">
              <Select
                multiple
                className="py-0.5 text-sm pr-8"
                value={intersectSelected}
                options={intersectOptions}
                onChange={onIntersectChanged}
              />
            </div>
          </div>
        )}
      </header>

      {type === 'bioregional' && splitSelected && (
        <ul className="pl-3">
          {splitFeaturesOptions.map((f) => {
            const checked = !splitFeaturesSelected.length
              || splitFeaturesSelected.includes(`${f.value}`);

            return (
              <li
                key={`${f.value}`}
                className="flex items-center px-2 py-1 mt-1 border-l border-primary-500"
              >
                <div className="relative flex text-xs font-heading">
                  <div className="mt-0.5 mr-2">
                    <Checkbox
                      id={`checkbox-${f.value}`}
                      value={`${f.value}`}
                      checked={checked}
                      className="block"
                      onChange={onSplitFeaturesChanged}
                    />
                  </div>

                  <label
                    htmlFor={`checkbox-${f.value}`}
                    className="inline-block max-w-sm"
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
