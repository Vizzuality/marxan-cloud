import React from 'react';

import { useFeatureFlags } from 'hooks/feature-flags';

import { cn } from 'utils/cn';

const BUTTON_COMMON_CLASSES =
  'relative py-2 transition after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:transform after:bg-primary-500 after:transition-all focus:outline-none text-black/85';
const BUTTON_ACTIVE_CLASSES = 'after:w-full';
const BUTTON_INACTIVE_CLASSES = 'text-gray-400';

type UploadFeatureMode = 'shapefile' | 'csv';

export const UploadFeatureTabs = ({
  mode,
  onChange,
}: {
  mode: UploadFeatureMode;
  onChange: (mode: UploadFeatureMode) => void;
}): JSX.Element => {
  const { CSVUpload } = useFeatureFlags();

  return (
    <div className="flex w-full space-x-4 border-b border-gray-400 text-xs font-medium text-black">
      <button
        type="button"
        className={cn({
          [BUTTON_COMMON_CLASSES]: true,
          [BUTTON_ACTIVE_CLASSES]: mode === 'shapefile',
          [BUTTON_INACTIVE_CLASSES]: mode !== 'shapefile',
        })}
        onClick={() => onChange('shapefile')}
      >
        Shapefile
      </button>

      {CSVUpload && (
        <button
          type="button"
          className={cn({
            [BUTTON_COMMON_CLASSES]: true,
            [BUTTON_ACTIVE_CLASSES]: mode === 'csv',
            [BUTTON_INACTIVE_CLASSES]: mode !== 'csv',
          })}
          onClick={() => onChange('csv')}
        >
          CSV
        </button>
      )}
    </div>
  );
};

export default UploadFeatureTabs;
