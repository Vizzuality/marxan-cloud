import React, { ReactNode, MutableRefObject, useCallback, useMemo } from 'react';

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

  selected?: boolean;
  onSelected?: (selected: boolean) => void;

  // SPLIT
  splitSelected?: string;
  splitOptions?: { key: string; values: any[] }[];
  onSplitSelected?: (selected: string) => void;
  splitFeaturesSelected?: {
    id: string;
    fpf?: number;
    target?: number;
  }[];
  splitFeaturesOptions?: ReactNode & { label?: string; value?: string }[];
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
  onRemove?: (value) => void;
  scrollRoot?: MutableRefObject<HTMLDivElement | null>;
}

export const Item: React.FC<ItemProps> = ({
  id,
  name,
  className,

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
    ...(scrollRoot && {
      root: scrollRoot.current,
    }),
  });

  // EVENTS
  const onSelectedChanged = useCallback(
    (e) => {
      if (onSelected) onSelected(e.target.checked);
    },
    [onSelected]
  );

  const onSplitChanged = useCallback(
    (s) => {
      if (onSplitSelected) onSplitSelected(s);
    },
    [onSplitSelected]
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
    [splitFeaturesSelected, onSplitFeaturesSelected]
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
          'px-4 pb-4 pt-2': true,
        })}
      >
        <div className="flex space-x-3">
          <Checkbox
            theme="light"
            id={`checkbox-${id}`}
            value={`${id}`}
            checked={selected}
            className="form-checkbox-dark mt-1.5 block h-4 w-4 text-green-300"
            onChange={onSelectedChanged}
          />
          <h2 className="mt-1 font-heading text-sm">{name}</h2>
        </div>

        {selected && (
          <div>
            <div className="mt-3 flex items-center font-heading tracking-wide">
              <Icon icon={SPLIT_SVG} className="h-5 w-5 text-green-300" />
              <h4 className="ml-2 text-xs uppercase text-gray-500">
                You can <strong>split</strong> this feature into categories
              </h4>
            </div>

            <div className="mt-2 inline-block">
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

      {splitSelected && selected && (
        <ul className="pl-3">
          {splitFeaturesOptions.map((f) => {
            const checked =
              !splitFeaturesSelected.length ||
              splitFeaturesSelected.map((s) => s.id).includes(`${f.value}`);

            return (
              <li key={`${f.value}`} className="relative mt-0.5 flex items-center py-2 pr-2.5">
                <div className="absolute left-0 top-0 block h-full w-px bg-green-300" />
                <div className="relative flex font-heading text-xs">
                  <div className="ml-2.5">
                    <Checkbox
                      theme="light"
                      id={`checkbox-${f.value}`}
                      value={`${f.value}`}
                      checked={checked}
                      className="form-checkbox-dark block h-4 w-4 text-green-300"
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
    </div>
  );
};

export default Item;
