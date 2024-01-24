import React, { useCallback, useRef, useState } from 'react';

import Loading from 'components/loading';
import { cn } from 'utils/cn';
import { blmFormat } from 'utils/units';

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

  const handleImageMouseMove = useCallback(
    (e) => {
      const imgContainer = imgContainerRef.current;
      const imgZoom = imgZoomRef.current;

      if (enter && imgContainer && imgZoom) {
        const { clientX, clientY } = e;
        const { left, top, width, height } = imgContainer.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;
        const xPercent = x / width;
        const yPercent = y / height;

        imgZoom.style.transform = `translate(${-xPercent * (imgZoom.naturalWidth - width)}px, ${
          -yPercent * (imgZoom.naturalHeight - height)
        }px)`;
        imgZoom.style.maxWidth = 'none';
        imgZoom.style.width = 500;
        imgZoom.style.height = 500;
      }
    },
    [enter]
  );

  return (
    <div
      role="presentation"
      key={id}
      className={cn({
        'relative cursor-pointer overflow-hidden rounded-md': true,
      })}
      onClick={handleClick}
    >
      <div
        className={cn({
          'pointer-events-none absolute left-0 top-0 z-10 h-full w-full rounded-md ring-2 ring-inset ring-offset-primary-500':
            selected,
        })}
      />
      <dl
        className={cn({
          'space-y-0.5 p-2': true,
          'bg-gray-700': !selected,
          'bg-primary-500': selected,
        })}
      >
        <div className="flex justify-between">
          <dt
            className={cn({
              'text-xs uppercase': true,
              'text-gray-800': selected,
            })}
          >
            BLM
          </dt>
          <dd
            className={cn({
              'text-xs': true,
              'text-primary-500': !selected,
              'text-gray-800': selected,
            })}
          >
            {blmFormat(blmValue)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt
            className={cn({
              'text-xs uppercase': true,
              'text-gray-800': selected,
            })}
          >
            Cost
          </dt>
          <dd
            className={cn({
              'text-xs': true,
              'text-primary-500': !selected,
              'text-gray-800': selected,
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
            className="flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />
        )}

        {pngData && (
          <div
            ref={imgContainerRef}
            className="relative w-full overflow-hidden"
            onMouseEnter={handleImageMouseEnter}
            onMouseLeave={handleImageMouseLeave}
            onMouseMove={handleImageMouseMove}
          >
            <img className="w-full" src={pngData} alt={`BLM: ${blmValue}`} />
            <img
              className={cn({
                'pointer-events-none absolute left-0 top-0 z-10': true,
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
