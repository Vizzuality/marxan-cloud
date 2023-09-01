import React from 'react';

import { PUAction } from 'store/slices/scenarios/types';

import { cn } from 'utils/cn';

export interface PlanningUnitTabsProps {
  type: PUAction;
  onChange: (action: PUAction) => void;
}

const BUTTON_COMMON_CLASSES =
  'relative py-2.5 text-sm transition after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:transform after:bg-primary-500 after:transition-all focus:outline-none';
const BUTTON_ACTIVE_CLASSES = 'after:w-full';
const BUTTON_INACTIVE_CLASSES = 'text-white/40';

export const PlanningUnitTabs: React.FC<PlanningUnitTabsProps> = ({
  type,
  onChange,
}: PlanningUnitTabsProps) => {
  return (
    <div className="flex w-full space-x-8">
      <button
        type="button"
        className={cn({
          [BUTTON_COMMON_CLASSES]: true,
          [BUTTON_ACTIVE_CLASSES]: type === 'include',
          [BUTTON_INACTIVE_CLASSES]: type !== 'include',
        })}
        onClick={() => onChange('include')}
      >
        Include areas
      </button>
      <button
        type="button"
        className={cn({
          [BUTTON_COMMON_CLASSES]: true,
          [BUTTON_ACTIVE_CLASSES]: type === 'exclude',
          [BUTTON_INACTIVE_CLASSES]: type !== 'exclude',
        })}
        onClick={() => onChange('exclude')}
      >
        Exclude areas
      </button>
      <button
        type="button"
        className={cn({
          [BUTTON_COMMON_CLASSES]: true,
          [BUTTON_ACTIVE_CLASSES]: type === 'available',
          'text-white/40': type !== 'available',
        })}
        onClick={() => onChange('available')}
      >
        Available areas
      </button>
    </div>
  );
};

export default PlanningUnitTabs;
