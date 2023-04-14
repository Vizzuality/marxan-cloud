import React, { useCallback } from 'react';

import { ViewportProps } from 'react-map-gl';

import cx from 'classnames';

import Icon from 'components/icon';

import FIT_BOUNDS_SVG from 'svgs/map/fit-bounds.svg?sprite';

export interface FitBoundsControlProps {
  bounds?: {
    bbox?: number[];
    options?: {};
    viewportOptions?: Partial<ViewportProps>;
  };
  className?: string;
  onFitBoundsChange: (bounds) => void;
}

export const FitBoundsControl = ({
  bounds,
  className,
  onFitBoundsChange,
}: FitBoundsControlProps) => {
  const handleFitBoundsChange = useCallback(() => {
    onFitBoundsChange(bounds);
  }, [bounds, onFitBoundsChange]);

  return (
    <button
      aria-label="fit-bounds"
      className={cx({
        'mb-0.5 rounded-4xl bg-black px-0.5 py-1 text-white focus:outline-none': true,
        'hover:bg-gray-700 active:bg-gray-600': !!bounds,
        'cursor-default opacity-50': !bounds,
        [className]: !!className,
      })}
      type="button"
      disabled={!bounds}
      onClick={handleFitBoundsChange}
    >
      <Icon icon={FIT_BOUNDS_SVG} />
    </button>
  );
};

export default FitBoundsControl;
