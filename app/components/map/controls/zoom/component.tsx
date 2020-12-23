import React, { useCallback } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';

import ZOOM_IN_SVG from 'svgs/map/zoom-in.svg?sprite';
import ZOOM_OUT_SVG from 'svgs/map/zoom-out.svg?sprite';

export interface ZoomControlProps {
  viewport: {
    zoom: number;
    maxZoom: number;
    minZoom: number;
  };
  className?: string;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControl = ({
  className,
  viewport,
  onZoomChange,
}: ZoomControlProps) => {
  const { zoom, maxZoom, minZoom } = viewport;

  const increaseZoom = useCallback(
    (e) => {
      e.stopPropagation();

      onZoomChange(zoom === maxZoom ? zoom : zoom + 1);
    },
    [zoom, maxZoom, onZoomChange],
  );

  const decreaseZoom = useCallback(
    (e) => {
      e.stopPropagation();

      onZoomChange(zoom === minZoom ? zoom : zoom - 1);
    },
    [zoom, minZoom, onZoomChange],
  );

  return (
    <div
      className={cx({
        'inline-flex flex-col': true,
        [className]: !!className,
      })}
    >
      <button
        className={cx({
          'mb-0.5 p-0.5 rounded-t-4xl text-white bg-black focus:outline-none': true,
          'hover:bg-gray-700 active:bg-gray-600': zoom !== maxZoom,
          'opacity-50 cursor-default': zoom === maxZoom,
        })}
        type="button"
        disabled={zoom === maxZoom}
        onClick={increaseZoom}
      >
        <Icon icon={ZOOM_IN_SVG} />
      </button>
      <button
        className={cx({
          'p-0.5 rounded-b-4xl text-white bg-black focus:outline-none': true,
          'hover:bg-gray-700 active:bg-gray-600': zoom !== minZoom,
          'opacity-50 cursor-default': zoom === minZoom,
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
