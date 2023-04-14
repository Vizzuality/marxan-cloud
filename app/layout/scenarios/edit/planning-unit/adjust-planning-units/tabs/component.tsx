import React from 'react';

import cx from 'classnames';

export interface PlanningUnitTabsProps {
  type: string;
  onChange: (s: string) => void;
}

export const PlanningUnitTabs: React.FC<PlanningUnitTabsProps> = ({
  type,
  onChange,
}: PlanningUnitTabsProps) => {
  return (
    <div className="flex w-full space-x-8">
      <button
        type="button"
        className={cx({
          'relative py-2.5 text-sm transition focus:outline-none': true,
          'text-gray-400': type !== 'include',
        })}
        onClick={() => onChange('include')}
      >
        Include areas
        <div
          className={cx({
            'absolute left-1/2 top-0 h-0.5 -translate-x-1/2 transform bg-primary-500 transition-all':
              true,
            'w-full': type === 'include',
            'w-0': type !== 'include',
          })}
        />
      </button>

      <button
        type="button"
        className={cx({
          'relative py-2.5 text-sm transition focus:outline-none': true,
          'text-gray-400': type !== 'exclude',
        })}
        onClick={() => onChange('exclude')}
      >
        Exclude areas
        <div
          className={cx({
            'absolute left-1/2 top-0 h-0.5 -translate-x-1/2 transform bg-primary-500 transition-all':
              true,
            'w-full': type === 'exclude',
            'w-0': type !== 'exclude',
          })}
        />
      </button>
    </div>
  );
};

export default PlanningUnitTabs;
