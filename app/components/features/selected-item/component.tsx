import React, { useCallback, useMemo, useState, ReactNode } from 'react';

import { HiEye, HiEyeOff } from 'react-icons/hi';

import { useFeatureFlags } from 'hooks/feature-flags';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Select from 'components/forms/select';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

import STRAT_1_IMG from 'images/info-buttons/img_strat_1.png';
import STRAT_2_IMG from 'images/info-buttons/img_strat_2.png';
import STRAT_3_IMG from 'images/info-buttons/img_strat_3.png';

import INTERSECT_SVG from 'svgs/ui/intersect.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import REMOVE_SVG from 'svgs/ui/remove.svg?sprite';
import SPLIT_SVG from 'svgs/ui/split.svg?sprite';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  description: string;
  type?: string;

  // SPLIT
  splitSelected?: string;
  splitOptions?: { key: string; values: any[] }[];
  onSplitSelected?: (selected: string) => void;
  splitFeaturesSelected?: {
    id: string;
    fpf?: number;
    target?: number;
  }[];
  // not ideal, but we need to pass the label and value to the checkbox
  // somehow and I have no enough context yet
  splitFeaturesOptions?: ReactNode & { label?: string; value?: string }[];
  editable?: boolean;
  onSplitFeaturesSelected?: (
    selected: {
      id: string;
      fpf?: number;
      target?: number;
    }[]
  ) => void;

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
  const [splitOpen, setSplitOpen] = useState(!!splitSelected);

  const { split, strat } = useFeatureFlags();

  // EVENTS
  const onSplitChanged = useCallback(
    (selected) => {
      if (onSplitSelected) onSplitSelected(selected);
    },
    [onSplitSelected]
  );

  const onSplitFeaturesChanged = useCallback(
    (e) => {
      const newSplitFeaturesSelected = [...splitFeaturesSelected];
      const index = newSplitFeaturesSelected.findIndex(
        (s) => `${s.id}` === `${e.currentTarget.value}`
      );

      if (index > -1) {
        newSplitFeaturesSelected.splice(index, 1);
      } else {
        newSplitFeaturesSelected.push({
          id: e.currentTarget.value,
        });
      }

      if (onSplitFeaturesSelected) onSplitFeaturesSelected(newSplitFeaturesSelected);
    },
    [splitFeaturesSelected, onSplitFeaturesSelected]
  );

  const onIntersectChanged = useCallback(
    (selected) => {
      if (onIntersectSelected) onIntersectSelected(selected);
    },
    [onIntersectSelected]
  );

  const OPTIONS = useMemo(() => {
    return splitOptions.map((s) => ({ label: s.key, value: s.key }));
  }, [splitOptions]);

  // RENDER
  return (
    <div
      className={cn({
        'bg-gray-800 text-white': true,
        [className]: !!className,
      })}
    >
      <header className="border-l-4 border-yellow-400 px-4 py-2">
        <div className="flex items-start justify-between">
          <h2 className="font-heading text-sm">{name}</h2>

          <div className="mr-3 flex space-x-2">
            {editable && split && !!OPTIONS.length && (
              <Tooltip
                arrow
                placement="top"
                content={<div className="rounded bg-white p-2 text-gray-600">Split</div>}
              >
                <button
                  aria-label="manage-see-on-map"
                  type="button"
                  onClick={() => setSplitOpen(!splitOpen)}
                  className={cn({
                    'flex h-5 w-5 items-center justify-center ': true,
                    'text-white': !splitSelected,
                    'text-yellow-500': !!splitSelected,
                  })}
                >
                  <Icon icon={SPLIT_SVG} className="h-4 w-4" />
                </button>
              </Tooltip>
            )}

            <Tooltip
              arrow
              placement="top"
              content={
                <div className="rounded bg-white p-2 text-gray-600">
                  {isShown ? 'Remove from map' : 'See on map'}
                </div>
              }
            >
              <button
                aria-label="manage-see-on-map"
                type="button"
                onClick={onSeeOnMap}
                className={cn({
                  'flex h-5 w-5 items-center justify-center text-white': true,
                  'text-gray-400': !isShown,
                })}
              >
                {isShown ? (
                  <HiEye className="h-4 w-4 text-blue-400" />
                ) : (
                  <HiEyeOff className="h-4 w-4" />
                )}
              </button>
            </Tooltip>

            {editable && (
              <Tooltip
                arrow
                placement="top"
                content={<div className="rounded bg-white p-2 text-gray-600">Remove</div>}
              >
                <button
                  aria-label="manage-see-on-map"
                  type="button"
                  onClick={() => onRemove && onRemove(id)}
                  className="flex h-5 w-5 items-center justify-center text-white"
                >
                  <Icon className="h-4 w-4" icon={REMOVE_SVG} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {split && splitOpen && (
          <div>
            <div className="mt-3 flex items-center space-x-2 font-heading tracking-wide">
              <h4 className="text-xxs uppercase text-white">
                You can <strong>split</strong> this feature into categories
              </h4>
              <InfoButton size="s">
                <span>
                  <h4 className="mb-2.5 font-heading text-lg">Split a feature</h4>
                  <div className="space-y-2">
                    <p>
                      You can split a dataset when you have several features together that you want
                      to treat separately.
                    </p>
                    <p>
                      For example, you may want to treat each ecoregion within a dataset as a
                      separate feature. You will be able to split your dataset by any of its
                      attributes.
                    </p>
                  </div>
                </span>
              </InfoButton>
            </div>

            <div className="mt-2 inline-block">
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
            <div className="mt-3 flex items-center space-x-2 font-heading tracking-wide">
              <Icon icon={INTERSECT_SVG} className="h-5 w-5 text-yellow-400" />
              <h4 className="ml-2 text-xs uppercase text-white">
                You can <strong>intersect</strong> this feature with others
              </h4>
              <InfoButton>
                <span>
                  <h4 className="mb-2.5 font-heading text-lg">Intersecting features</h4>
                  <div className="space-y-2">
                    <p>
                      Stratification is the process of intersecting a single feature into multiple
                      features. This is helpful for setting more specific targets for important
                      features like species distributions, where you want to replicate and
                      distribute priority areas more evenly across your planning area.
                    </p>
                    <p>
                      For example, if you have a species range across the landscape and you set a
                      30% target, it is possible that the 30% will be met in one type of ecosystem.
                    </p>
                    <p>See this example with the Giant Anteater&apos;s range:</p>
                    <img src={STRAT_1_IMG} alt="Stratification_1" />

                    <p>
                      This is problematic because only one ecosystem is conserved for the species.
                      In reality, we want to ensure all important habitats within the species range
                      benefit from conservation. To address this, we can &apos;stratify&apos; the
                      species range by ecosystem and create new features for setting targets.
                    </p>
                    <img src={STRAT_2_IMG} alt="Stratification_2" />
                    <img src={STRAT_3_IMG} alt="Stratification_3" />
                  </div>
                </span>
              </InfoButton>
            </div>

            <div className="mt-2 inline-block">
              <Button
                theme="secondary-alt"
                size="s"
                onClick={() => {
                  onIntersectChanged(id);
                }}
              >
                <div className="flex items-center">
                  <span>Select features</span>

                  <Icon icon={PLUS_SVG} className="ml-3 h-3 w-3" />
                </div>
              </Button>
            </div>
          </div>
        )}
      </header>

      {splitSelected && split && splitOpen && (
        <ul className="pl-3">
          {splitFeaturesOptions.map((f) => {
            const checked =
              !splitFeaturesSelected.length ||
              !!splitFeaturesSelected.find((s) => `${f.value}` === `${s.id}`);

            return (
              <li key={`${f.value}`} className="relative mt-0.5 flex items-center py-2 pr-2.5">
                <div className="absolute left-0 top-0 block h-full w-px bg-yellow-300" />
                <div className="relative flex font-heading text-xs">
                  <div className="ml-2.5">
                    <Checkbox
                      id={`checkbox-${f.value}`}
                      value={`${f.value}`}
                      checked={checked}
                      className="form-checkbox-dark block h-4 w-4 text-yellow-300"
                      onChange={onSplitFeaturesChanged}
                    />
                  </div>

                  <label htmlFor={`checkbox-${f.value}`} className="ml-2.5 inline-block max-w-sm">
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
              <li key={`${f.value}`} className="relative mt-0.5 flex items-center py-2 pr-2.5">
                <div className="absolute left-0 top-0 block h-full w-px bg-gradient-to-b from-green-400 to-yellow-400" />
                <div className="relative flex font-heading text-xs">
                  <div className="ml-2.5 inline-block max-w-sm">
                    {name} in {f.label}
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
