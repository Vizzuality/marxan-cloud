import React from 'react';
import cx from 'classnames';

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
      className={cx({
        'relative w-full': true,
        className: !!className,
      })}
    >
      <div className="h-0.5 bg-gradient-to-r from-gradient-initial to-gradient-final opacity-30" />
      <div
        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-gradient-initial to-gradient-final max-w-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
