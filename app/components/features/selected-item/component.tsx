import React, { useCallback, useMemo } from 'react';

import cx from 'classnames';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Select from 'components/forms/select';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import STRAT_1_IMG from 'images/info-buttons/img_strat_1.png';
import STRAT_2_IMG from 'images/info-buttons/img_strat_2.png';
import STRAT_3_IMG from 'images/info-buttons/img_strat_3.png';

import INTERSECT_SVG from 'svgs/ui/intersect.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import SPLIT_SVG from 'svgs/ui/split.svg?sprite';

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
  editable?: boolean;
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
  onRemove?: (value) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Item: React.FC<ItemProps> = ({
  id,
  name,
  className,
  description,
  type,

  splitSelected,
  splitOptions = [],
  editable,
  onSplitSelected,

  splitFeaturesSelected,
  splitFeaturesOptions = [],
  onSplitFeaturesSelected,

  intersectFeaturesSelected = [],

  onIntersectSelected,
  onRemove,
  onMouseEnter,
  onMouseLeave,
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

          {editable && (
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

        {type === 'bioregional' && (
          <div>
            <div className="flex items-center mt-3 space-x-2 tracking-wide font-heading">
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
                  <div className="space-y-2">
                    <p>
                      You can split a dataset when you have several
                      features together that you want to treat separately.
                    </p>
                    <p>
                      For example, you may want to treat each ecoregion
                      within a dataset as a separate feature.
                      You will be able to split your dataset
                      by any of its attributes.
                    </p>
                  </div>
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

        {type === 'species' && editable && (
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
                  <div className="space-y-2">
                    <p>
                      Stratification is the process of intersecting a
                      single feature into multiple features. This is
                      helpful for setting more specific targets for
                      important features like species distributions,
                      where you want to replicate and distribute priority
                      areas more evenly across your planning area.
                    </p>
                    <p>
                      For example, if you have a species range across
                      the landscape and you set a 30% target, it is
                      possible that the 30% will be met in one type
                      of ecosystem.
                    </p>
                    <p>See this example with the Giant Anteater&apos;s range:</p>
                    <img src={STRAT_1_IMG} alt="Stratification_1" />

                    <p>
                      This is problematic because only one ecosystem is
                      conserved for the species. In reality,
                      we want to ensure all important habitats
                      within the species range benefit from conservation.
                      To address this, we can &apos;stratify&apos; the species
                      range by ecosystem and create new features for
                      setting targets.
                    </p>
                    <img src={STRAT_2_IMG} alt="Stratification_2" />
                    <img src={STRAT_3_IMG} alt="Stratification_3" />
                  </div>

                </span>
              </InfoButton>
            </div>

            <div className="inline-block mt-2">
              <Button
                theme="secondary-alt"
                size="s"
                onClick={() => {
                  onIntersectChanged(id);
                  onMouseLeave();
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
