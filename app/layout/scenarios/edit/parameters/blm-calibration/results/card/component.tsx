import React, { useCallback, useRef, useState } from 'react';

import cx from 'classnames';
import { blmFormat } from 'utils/units';

import Loading from 'components/loading';

export interface ScenariosBlmResultsCardProps {
  id: string;
  blmValue: number;
  cost: number;
  selected: boolean;
  pngData?: string;
  onClick: (id: number) => void;
}

export const ScenariosBlmResultsCard: React.FC<ScenariosBlmResultsCardProps> = ({
  id,
  blmValue,
  cost,
  selected,
  pngData,
  onClick,
}: ScenariosBlmResultsCardProps) => {
  const imgContainerRef = useRef(null);
  const imgZoomRef = useRef(null);
  const [enter, setEnter] = useState(false);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(blmValue);
    }
  }, [blmValue, onClick]);

  const handleImageMouseEnter = useCallback(() => {
    setEnter(true);
  }, []);

  const handleImageMouseLeave = useCallback(() => {
    setEnter(false);
  }, []);

  const handleImageMouseMove = useCallback((e) => {
    const imgContainer = imgContainerRef.current;
    const imgZoom = imgZoomRef.current;

    if (enter && imgContainer && imgZoom) {
      const { clientX, clientY } = e;
      const {
        left, top, width, height,
      } = imgContainer.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      const xPercent = (x / width);
      const yPercent = (y / height);

      imgZoom.style.transform = `translate(${-xPercent * (imgZoom.naturalWidth - width)}px, ${-yPercent * (imgZoom.naturalHeight - height)}px)`;
      imgZoom.style.maxWidth = 'none';
      imgZoom.style.width = 500;
      imgZoom.style.height = 500;
    }
  }, [enter]);

  return (
    <div
      role="presentation"
      key={id}
      className={cx({
        'relative overflow-hidden rounded-md cursor-pointer': true,

      })}
      onClick={handleClick}
    >
      <div
        className={cx({
          'absolute w-full h-full top-0 left-0 z-10 ring-2 ring-offset-primary-500 ring-inset rounded-md pointer-events-none': selected,
        })}
      />
      <dl
        className={cx({
          'p-2 space-y-0.5': true,
          'bg-gray-500': !selected,
          'bg-primary-500': selected,
        })}
      >
        <div className="flex justify-between">
          <dt
            className={cx({
              'text-xs uppercase': true,
              'text-gray-700': selected,
            })}
          >
            BLM
          </dt>
          <dd
            className={cx({
              'text-xs': true,
              'text-primary-500': !selected,
              'text-gray-700': selected,
            })}
          >
            {blmFormat(blmValue)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt
            className={cx({
              'text-xs uppercase': true,
              'text-gray-700': selected,
            })}
          >
            Cost
          </dt>
          <dd
            className={cx({
              'text-xs': true,
              'text-primary-500': !selected,
              'text-gray-700': selected,
            })}
          >
            {cost}
          </dd>
        </div>
      </dl>

      <div>
        {!pngData && (
          <Loading
            visible
            className="flex items-center justify-center w-full h-full bg-gray-700 bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />
        )}

        {pngData && (
          <div
            ref={imgContainerRef}
            className="w-full relative overflow-hidden"
            onMouseEnter={handleImageMouseEnter}
            onMouseLeave={handleImageMouseLeave}
            onMouseMove={handleImageMouseMove}
          >
            <img className="w-full" src={pngData} alt={`BLM: ${blmValue}`} />
            <img
              className={cx({
                'absolute z-10 top-0 left-0 pointer-events-none': true,
                invisible: !enter,
              })}
              ref={imgZoomRef}
              src={pngData}
              alt={`BLM: ${blmValue}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenariosBlmResultsCard;
