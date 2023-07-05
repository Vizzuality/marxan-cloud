import React from 'react';

import type { PUAction } from 'store/slices/scenarios/types';

import { cn } from 'utils/cn';

export interface PlanningUnitTabsProps {
  type: PUAction;
  onChange: (action: PUAction) => void;
}

export const PlanningUnitTabs: React.FC<PlanningUnitTabsProps> = ({
  type,
  onChange,
}: PlanningUnitTabsProps) => {
  return (
    <div className="flex w-full space-x-8">
      <button
        type="button"
        className={cn({
          'relative py-2.5 text-sm transition focus:outline-none': true,
          'text-gray-400': type !== 'include',
        })}
        onClick={() => onChange('include')}
      >
        Include areas
        <div
          className={cn({
            'absolute -bottom-[1px] left-1/2 h-0.5 w-0 -translate-x-1/2 transform bg-primary-500 transition-all':
              true,
            'w-full': type === 'include',
          })}
        />
      </button>

      <button
        type="button"
        className={cn({
          'relative py-2.5 text-sm transition focus:outline-none': true,
          'text-gray-400': type !== 'available',
        })}
        onClick={() => onChange('available')}
      >
        Available areas
        <div
          className={cn({
            'absolute -bottom-[1px] left-1/2 h-0.5 w-0 -translate-x-1/2 transform bg-primary-500 transition-all':
              true,
            'w-full': type === 'available',
          })}
        />
      </button>

      <button
        type="button"
        className={cn({
          'relative py-2.5 text-sm transition focus:outline-none': true,
          'text-gray-400': type !== 'exclude',
        })}
        onClick={() => onChange('exclude')}
      >
        Exclude areas
        <div
          className={cn({
            'absolute -bottom-[1px] left-1/2 h-0.5 w-0 -translate-x-1/2 transform bg-primary-500 transition-all':
              true,
            'w-full': type === 'exclude',
          })}
        />
      </button>
    </div>
  );
};

export default PlanningUnitTabs;
