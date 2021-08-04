import React, { useCallback, useMemo } from 'react';

import cx from 'classnames';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Select from 'components/forms/select';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import INTERSECT_SVG from 'svgs/ui/intersect.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import SPLIT_SVG from 'svgs/ui/split.svg?sprite';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  description: string;
  type: 'bioregional' | 'species';

  // EDIT/SHOW
  readOnly?: boolean;

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

  readOnly,

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

          {!readOnly && (
            <Button
              className="flex-shrink-0 text-xs"
              theme="secondary"
              size="xs"
              onClick={() => onRemove && onRemove(id)}
            >
              Remove
            </Button>
          )}

        </div>
        <div className="mt-2 text-sm opacity-50 clamp-2">{description}</div>

        {type === 'bioregional' && !readOnly && (
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
              <InfoButton>
                <span>
                  <h4 className="font-heading text-lg mb-2.5">Split a feature</h4>
                  You should split a dataset when you have several
                  features together that you want to treat separately.

                  For example, if you may want to treat each ecoregion
                  within a dataset as a separate feature.
                  You will be able to split your dataset
                  by any of the available attributes in the feature.

                </span>
              </InfoButton>
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

        {type === 'species' && !readOnly && (
          <div>
            <div className="flex items-center mt-3 space-x-2 tracking-wide font-heading">
              <Icon icon={INTERSECT_SVG} className="w-5 h-5 text-yellow-300" />
              <h4 className="ml-2 text-xs text-white uppercase">
                You can
                {' '}
                <strong>intersect</strong>
                {' '}
                this feature with others
              </h4>
              <InfoButton>
                <span>
                  <h4 className="font-heading text-lg mb-2.5">Intersecting features</h4>
                  You may want to intersect two or more features when
                  you are interested in having a new feature that
                  combines the information of both. For example,
                  you may wish to ensure that Marxan identifies
                  priority areas for a given feature across a
                  range of habitats. In
                  this case you can intersect a species
                  distribution with a habitat or ecosystem
                  layer thereby making your species features
                  ecologically representative.

                </span>
              </InfoButton>
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
