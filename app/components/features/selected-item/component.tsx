import React, { useCallback, useMemo, useState } from 'react';

import cx from 'classnames';

import { useFeatureFlags } from 'hooks/feature-flags';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Select from 'components/forms/select';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Tooltip from 'components/tooltip';

import STRAT_1_IMG from 'images/info-buttons/img_strat_1.png';
import STRAT_2_IMG from 'images/info-buttons/img_strat_2.png';
import STRAT_3_IMG from 'images/info-buttons/img_strat_3.png';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import INTERSECT_SVG from 'svgs/ui/intersect.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import REMOVE_SVG from 'svgs/ui/remove.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';
import SPLIT_SVG from 'svgs/ui/split.svg?sprite';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  description: string;

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
  isShown?: boolean;
  onSeeOnMap?: () => void;
}

export const Item: React.FC<ItemProps> = ({
  id,
  name,
  className,

  splitSelected,
  splitOptions = [],
  editable,
  onSplitSelected,

  splitFeaturesSelected = [],
  splitFeaturesOptions = [],
  onSplitFeaturesSelected,

  intersectFeaturesSelected = [],

  onIntersectSelected,
  onRemove,
  isShown,
  onSeeOnMap,
}: ItemProps) => {
  const [splitOpen, setSplitOpen] = useState(false);

  const {
    split,
    strat,
  } = useFeatureFlags();

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
          'px-4 py-2 border-l-4': true,
          'border-purple-500': true,
        })}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-heading">{name}</h2>

          <div className="flex mr-3 space-x-2">
            {split && !!OPTIONS.length && (
              <Tooltip
                arrow
                placement="top"
                content={(
                  <div
                    className="p-2 text-gray-500 bg-white rounded"
                  >
                    Split
                  </div>
                )}
              >
                <button
                  aria-label="manage-see-on-map"
                  type="button"
                  onClick={() => setSplitOpen(!splitOpen)}
                  className={cx({
                    'flex items-center justify-center w-5 h-5 ': true,
                    'text-white': !splitFeaturesSelected.length,
                    'text-purple-500': !!splitFeaturesSelected.length,
                  })}
                >
                  <Icon icon={SPLIT_SVG} className="w-4 h-4" />
                </button>
              </Tooltip>
            )}

            <Tooltip
              arrow
              placement="top"
              content={(
                <div
                  className="p-2 text-gray-500 bg-white rounded"
                >
                  See on map
                </div>
              )}
            >
              <button
                aria-label="manage-see-on-map"
                type="button"
                onClick={onSeeOnMap}
                className={cx({
                  'text-white w-5 h-5 flex justify-center items-center': true,
                  'text-gray-300': !isShown,
                })}
              >
                <Icon className="w-4 h-4" icon={isShown ? SHOW_SVG : HIDE_SVG} />
              </button>
            </Tooltip>

            {editable && (
              <Tooltip
                arrow
                placement="top"
                content={(
                  <div
                    className="p-2 text-gray-500 bg-white rounded"
                  >
                    Remove
                  </div>
                )}
              >
                <button
                  aria-label="manage-see-on-map"
                  type="button"
                  onClick={() => onRemove && onRemove(id)}
                  className="flex items-center justify-center w-5 h-5 text-white"
                >
                  <Icon className="w-4 h-4" icon={REMOVE_SVG} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {split && splitOpen && (
          <div>
            <div className="flex items-center mt-3 space-x-2 tracking-wide font-heading">
              <h4 className="text-white uppercase text-xxs">
                You can
                {' '}
                <strong>split</strong>
                {' '}
                this feature into categories
              </h4>
              <InfoButton
                size="s"
              >
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

        {editable && strat && (
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

      {splitSelected && split && (
        <ul className="pl-3">
          {splitFeaturesOptions.map((f) => {
            const checked = !splitFeaturesSelected.length
              || splitFeaturesSelected.map((s) => `${s.id}`).includes(`${f.value}`);

            return (
              <li
                key={`${f.value}`}
                className="flex items-center pr-2.5 py-2 mt-0.5 relative"
              >
                <div className="absolute top-0 left-0 block w-px h-full bg-purple-300" />
                <div className="relative flex text-xs font-heading">
                  <div className="ml-2.5">
                    <Checkbox
                      id={`checkbox-${f.value}`}
                      value={`${f.value}`}
                      checked={checked}
                      className="block w-4 h-4 text-purple-300 form-checkbox-dark"
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

      {intersectFeaturesSelected && !!intersectFeaturesSelected.length && strat && (
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
