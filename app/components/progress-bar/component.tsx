import React from 'react';

import { cn } from 'utils/cn';

export interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
}: ProgressBarProps) => {
  return (
    <div
      className={cn({
        'relative w-full': true,
        className: !!className,
      })}
    >
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 opacity-30" />
      <div
        className="absolute bottom-0 h-0.5 max-w-full bg-gradient-to-r from-blue-500 to-purple-600"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
