import React, { useCallback } from 'react';

import { ViewportProps } from 'react-map-gl';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ZOOM_IN_SVG from 'svgs/map/zoom-in.svg?sprite';
import ZOOM_OUT_SVG from 'svgs/map/zoom-out.svg?sprite';

export interface ZoomControlProps {
  viewport: Partial<ViewportProps>;
  className?: string;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControl = ({ className, viewport, onZoomChange }: ZoomControlProps) => {
  const { zoom, maxZoom, minZoom } = viewport;

  const increaseZoom = useCallback(
    (e) => {
      e.stopPropagation();

      onZoomChange(zoom + 1 > maxZoom ? maxZoom : zoom + 1);
    },
    [zoom, maxZoom, onZoomChange]
  );

  const decreaseZoom = useCallback(
    (e) => {
      e.stopPropagation();

      onZoomChange(zoom - 1 < minZoom ? minZoom : zoom - 1);
    },
    [zoom, minZoom, onZoomChange]
  );

  return (
    <div
      className={cn({
        'inline-flex flex-col': true,
        [className]: !!className,
      })}
    >
      <button
        aria-label="zoom-in"
        className={cn({
          'mb-0.5 rounded-t-full bg-black p-0.5 text-white focus:outline-none': true,
          'hover:bg-gray-800 active:bg-gray-700': zoom !== maxZoom,
          'cursor-default opacity-50': zoom === maxZoom,
        })}
        type="button"
        disabled={zoom === maxZoom}
        onClick={increaseZoom}
      >
        <Icon icon={ZOOM_IN_SVG} />
      </button>
      <button
        aria-label="zoom-out"
        className={cn({
          'rounded-b-full bg-black p-0.5 text-white focus:outline-none': true,
          'hover:bg-gray-800 active:bg-gray-700': zoom !== minZoom,
          'cursor-default opacity-50': zoom === minZoom,
        })}
        type="button"
        disabled={zoom === minZoom}
        onClick={decreaseZoom}
      >
        <Icon icon={ZOOM_OUT_SVG} />
      </button>
    </div>
  );
};

export default ZoomControl;
