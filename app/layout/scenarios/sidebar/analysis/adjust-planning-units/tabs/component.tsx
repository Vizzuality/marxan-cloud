import React from 'react';
import cx from 'classnames';

export interface AnalysisAdjustTabsProps {
  type: string;
  onChange: (s: string) => void;
}

export const AnalysisAdjustTabs: React.FC<AnalysisAdjustTabsProps> = ({
  type,
  onChange,
}: AnalysisAdjustTabsProps) => {
  return (
    <div className="flex w-full space-x-8">
      <button
        type="button"
        className={cx({
          'text-sm py-2.5 focus:outline-none relative transition': true,
          'text-gray-400': type !== 'include',
        })}
        onClick={() => onChange('include')}
      >
        Include areas
        <div
          className={cx({
            'absolute top-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary-500 transition-all': true,
            'w-full': type === 'include',
            'w-0': type !== 'include',
          })}
        />
      </button>

      <button
        type="button"
        className={cx({
          'text-sm py-2.5 focus:outline-none relative transition': true,
          'text-gray-400': type !== 'exclude',
        })}
        onClick={() => onChange('exclude')}
      >
        Exclude areas
        <div
          className={cx({
            'absolute top-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary-500 transition-all': true,
            'w-full': type === 'exclude',
            'w-0': type !== 'exclude',
          })}
        />
      </button>
    </div>
  );
};

export default AnalysisAdjustTabs;
